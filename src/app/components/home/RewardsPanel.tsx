import React from 'react';

import { t, Trans } from '@lingui/macro';
import { useIconReact } from 'packages/icon-react';
import { Flex, Box } from 'rebass/styled-components';

import { Button, TextButton } from 'app/components/Button';
import Modal from 'app/components/Modal';
import { BoxPanel } from 'app/components/Panel';
import QuestionHelper from 'app/components/QuestionHelper';
import { Typography } from 'app/theme';
import bnJs from 'bnJs';
import { ZERO } from 'constants/index';
import { useUserCollectedFeesQuery, useRewardQuery, usePlatformDayQuery, BATCH_SIZE } from 'queries/reward';
import { useChangeShouldLedgerSign, useShouldLedgerSign } from 'store/application/hooks';
import { useHasNetworkFees, useHasRewardable } from 'store/reward/hooks';
import { TransactionStatus, useTransactionAdder, useTransactionStatus } from 'store/transactions/hooks';
import { useBALNDetails, useHasEnoughICX } from 'store/wallet/hooks';
import { showMessageOnBeforeUnload } from 'utils/messages';

import ModalContent from '../ModalContent';
import Spinner from '../Spinner';

const RewardsPanel = () => {
  return (
    <div>
      <BoxPanel bg="bg2">
        <Flex alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h2">
            <Trans>Rewards</Trans>
          </Typography>
        </Flex>

        <Flex>
          <RewardSection />
          <NetworkFeeSection />
        </Flex>
      </BoxPanel>
    </div>
  );
};

export default RewardsPanel;

const RewardSection = () => {
  const { account } = useIconReact();
  const addTransaction = useTransactionAdder();
  const shouldLedgerSign = useShouldLedgerSign();

  const changeShouldLedgerSign = useChangeShouldLedgerSign();

  const handleRewardClaim = () => {
    window.addEventListener('beforeunload', showMessageOnBeforeUnload);

    if (bnJs.contractSettings.ledgerSettings.actived) {
      changeShouldLedgerSign(true);
    }

    bnJs
      .inject({ account })
      .Rewards.claimRewards()
      .then(res => {
        addTransaction(
          { hash: res.result }, //
          {
            summary: t`Claimed ${reward?.dp(2).toFormat()} BALN.`,
            pending: t`Claiming rewards...`,
          },
        );
        setRewardTx(res.result);
        toggleOpen();
      })
      .catch(e => {
        console.error('error', e);
      })
      .finally(() => {
        changeShouldLedgerSign(false);
        window.removeEventListener('beforeunload', showMessageOnBeforeUnload);
      });
  };

  const rewardQuery = useRewardQuery();
  const reward = rewardQuery.data;

  const hasRewardable = useHasRewardable();

  const [rewardTx, setRewardTx] = React.useState('');
  const rewardTxStatus = useTransactionStatus(rewardTx);
  React.useEffect(() => {
    if (rewardTxStatus === TransactionStatus.success) rewardQuery.refetch();
  }, [rewardTxStatus, rewardQuery]);

  const [open, setOpen] = React.useState(false);
  const toggleOpen = () => {
    if (shouldLedgerSign) return;
    setOpen(!open);
  };

  const getRewardsUI = () => {
    if (!hasRewardable && reward?.isZero()) {
      return (
        <>
          <Typography variant="p" as="div">
            <Trans>Ineligible</Trans>
            <QuestionHelper
              text={t`To earn Balanced rewards, take out a loan or supply liquidity on the Trade page.`}
            />
          </Typography>
        </>
      );
    } else if (reward?.isZero()) {
      return (
        <>
          <Typography variant="p" as="div">
            <Trans>Pending</Trans>
            <QuestionHelper
              text={t`To earn Balanced rewards, take out a loan or supply liquidity on the Trade page.`}
            />
          </Typography>
        </>
      );
    } else {
      return (
        <>
          <Typography variant="p">
            {`${reward?.dp(2).toFormat()} `}
            <Typography as="span" color="text1">
              BALN
            </Typography>
          </Typography>
          <Button mt={2} onClick={toggleOpen}>
            <Trans>Claim</Trans>
          </Button>
        </>
      );
    }
  };

  const hasEnoughICX = useHasEnoughICX();

  const BALNDetails = useBALNDetails();

  const beforeAmount = BALNDetails['Total balance'] || ZERO;

  const afterAmount = beforeAmount.plus(reward || ZERO);

  return (
    <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
      <Typography variant="p" mb={2}>
        <Trans>Balance Tokens</Trans>
      </Typography>
      {reward && getRewardsUI()}

      <Modal isOpen={open} onDismiss={toggleOpen}>
        <ModalContent>
          <Typography textAlign="center" mb={1}>
            <Trans>Claim Balance Tokens?</Trans>
          </Typography>

          <Typography variant="p" fontWeight="bold" textAlign="center" fontSize={20}>
            {reward?.dp(2).toFormat() + ' BALN'}
          </Typography>

          <Flex my={5}>
            <Box width={1 / 2} className="border-right">
              <Typography textAlign="center">
                <Trans>Before</Trans>
              </Typography>
              <Typography variant="p" textAlign="center">
                {beforeAmount.dp(2).toFormat() + ' BALN'}
              </Typography>
            </Box>

            <Box width={1 / 2}>
              <Typography textAlign="center">
                <Trans>After</Trans>
              </Typography>
              <Typography variant="p" textAlign="center">
                {afterAmount.dp(2).toFormat() + ' BALN'}
              </Typography>
            </Box>
          </Flex>

          <Typography textAlign="center">
            <Trans>To earn network fees, stake BALN from your wallet.</Trans>
          </Typography>

          <Flex justifyContent="center" mt={4} pt={4} className="border-top">
            {shouldLedgerSign && <Spinner></Spinner>}
            {!shouldLedgerSign && (
              <>
                <TextButton onClick={toggleOpen} fontSize={14}>
                  <Trans>Not now</Trans>
                </TextButton>
                <Button onClick={handleRewardClaim} fontSize={14} disabled={!hasEnoughICX}>
                  <Trans>Claim</Trans>
                </Button>
              </>
            )}
          </Flex>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

const NetworkFeeSection = () => {
  const { account } = useIconReact();
  const [feeTx, setFeeTx] = React.useState('');
  const shouldLedgerSign = useShouldLedgerSign();

  const changeShouldLedgerSign = useChangeShouldLedgerSign();
  const addTransaction = useTransactionAdder();

  const handleFeeClaim = () => {
    window.addEventListener('beforeunload', showMessageOnBeforeUnload);

    if (bnJs.contractSettings.ledgerSettings.actived) {
      changeShouldLedgerSign(true);
    }
    const end = platformDay - feesIndex * BATCH_SIZE;
    const start = end - BATCH_SIZE > 0 ? end - BATCH_SIZE : 0;

    bnJs
      .inject({ account })
      .Dividends.claim(start, end)
      .then(res => {
        addTransaction(
          { hash: res.result }, //
          {
            summary: t`Claimed fees.`,
            pending: t`Claiming fees...`,
          },
        );
        setFeeTx(res.result);
        toggleOpen();
      })
      .catch(e => {
        console.error('error', e);
      })
      .finally(() => {
        changeShouldLedgerSign(false);
        window.removeEventListener('beforeunload', showMessageOnBeforeUnload);
      });
  };

  const feeTxStatus = useTransactionStatus(feeTx);
  React.useEffect(() => {
    if (feeTxStatus === TransactionStatus.success) feesQuery.refetch();
  });

  const hasNetworkFees = useHasNetworkFees();
  const { data: platformDay = 0 } = usePlatformDayQuery();
  const feesQuery = useUserCollectedFeesQuery(1, platformDay);
  const feesArr = feesQuery.data;
  const fees = feesArr?.find(fees => fees);
  const feesIndex = feesArr?.findIndex(fees => fees) || 0;
  const hasFee = !!fees;
  const count = feesArr?.reduce((c, v) => (v ? ++c : c), 0);

  const [open, setOpen] = React.useState(false);
  const toggleOpen = () => {
    if (shouldLedgerSign) return;

    setOpen(!open);
  };

  const hasEnoughICX = useHasEnoughICX();

  const getNetworkFeesUI = () => {
    if (hasNetworkFees && !hasFee) {
      return (
        <Typography variant="p" as="div">
          <Trans>Pending</Trans>
          <QuestionHelper text={t`To earn network fees, stake BALN from your wallet.`} />
        </Typography>
      );
    } else if (hasFee) {
      return (
        <>
          {fees &&
            Object.keys(fees)
              .filter(key => fees[key].greaterThan(0))
              .map(key => (
                <Typography key={key} variant="p">
                  {`${fees[key].toFixed(2)}`}{' '}
                  <Typography key={key} as="span" color="text1">
                    {fees[key].currency.symbol}
                  </Typography>
                </Typography>
              ))}

          <Button mt={2} onClick={toggleOpen}>
            {count && count > 1 ? t`Claim (1 of ${count})` : t`Claim`}
          </Button>
        </>
      );
    } else {
      return (
        <Typography variant="p" as="div">
          <Trans>Ineligible</Trans>
          <QuestionHelper text={t`To earn network fees, stake BALN from your wallet.`} />
        </Typography>
      );
    }
  };

  return (
    <Flex flex={1} flexDirection="column" alignItems="center">
      <Typography variant="p" mb={2} as="div">
        <Trans>Network fees</Trans>
      </Typography>
      {getNetworkFeesUI()}

      <Modal isOpen={open} onDismiss={toggleOpen}>
        <ModalContent>
          <Typography textAlign="center" mb={1}>
            <Trans>Claim network fees?</Trans>
          </Typography>

          <Flex flexDirection="column" alignItems="center" mt={2}>
            {fees &&
              Object.keys(fees)
                .filter(key => fees[key].greaterThan(0))
                .map(key => (
                  <Typography key={key} variant="p">
                    {`${fees[key].toFixed(2)}`}{' '}
                    <Typography key={key} as="span" color="text1">
                      {fees[key].currency.symbol}
                    </Typography>
                  </Typography>
                ))}
          </Flex>

          <Flex justifyContent="center" mt={4} pt={4} className="border-top">
            {shouldLedgerSign && <Spinner></Spinner>}
            {!shouldLedgerSign && (
              <>
                <TextButton onClick={toggleOpen} fontSize={14}>
                  <Trans>Not now</Trans>
                </TextButton>
                <Button onClick={handleFeeClaim} fontSize={14} disabled={!hasEnoughICX}>
                  <Trans>Claim</Trans>
                </Button>
              </>
            )}
          </Flex>
        </ModalContent>
      </Modal>
    </Flex>
  );
};
