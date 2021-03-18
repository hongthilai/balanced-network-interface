import React from 'react';

import Nouislider from 'nouislider-react';
import { Flex, Box } from 'rebass/styled-components';
import styled from 'styled-components';

import { Button, TextButton } from 'app/components/Button';
import CurrencyInputPanel from 'app/components/CurrencyInputPanel';
import Modal from 'app/components/Modal';
import LiquiditySelect from 'app/components/trade/LiquiditySelect';
import { Typography } from 'app/theme';
import { CURRENCYLIST } from 'constants/currency';
import { usePoolPair } from 'store/pool/hooks';

import { SectionPanel, BrightPanel } from './utils';

const StyledDL = styled.dl`
  margin: 15px 0 15px 0;
  text-align: center;

  > dd {
    margin-left: 0;
  }
`;

const SupplyButton = styled(Button)`
  padding: 5px 10px;
  font-size: 12px;
`;

export default function LPPanel() {
  const handleTypeInput = (val: string) => {};

  const [showSupplyConfirm, setShowSupplyConfirm] = React.useState(false);

  const handleSupplyConfirmDismiss = () => {
    setShowSupplyConfirm(false);
  };

  const handleSupply = () => {
    setShowSupplyConfirm(true);
  };

  const selectedPair = usePoolPair();

  return (
    <>
      <SectionPanel bg="bg2">
        <BrightPanel bg="bg3" p={7} flexDirection="column" alignItems="stretch" flex={1}>
          <Flex alignItems="flex-end">
            <Typography variant="h2">Supply:</Typography>
            <LiquiditySelect />
          </Flex>

          <Flex mt={3}>
            <CurrencyInputPanel
              value="0"
              showMaxButton={false}
              currency={CURRENCYLIST[selectedPair.baseCurrencyKey.toLowerCase()]}
              onUserInput={handleTypeInput}
              disableCurrencySelect={true}
              id="supply-liquidity-input-tokena"
            />
          </Flex>

          <Flex mt={3}>
            <CurrencyInputPanel
              value="0"
              showMaxButton={false}
              currency={CURRENCYLIST[selectedPair.quoteCurrencyKey.toLowerCase()]}
              onUserInput={handleTypeInput}
              disableCurrencySelect={true}
              id="supply-liquidity-input-tokenb"
            />
          </Flex>

          <Typography mt={3} textAlign="right">
            Wallet: 12,000 {selectedPair.baseCurrencyKey} / 1,485 {selectedPair.quoteCurrencyKey}
          </Typography>

          <Box mt={5}>
            <Nouislider
              id="slider-supply"
              start={[0]}
              padding={[0]}
              connect={[true, false]}
              range={{
                min: [0],
                max: [100],
              }}
            />
          </Box>

          <Flex justifyContent="center">
            <Button color="primary" marginTop={5} onClick={handleSupply}>
              Supply
            </Button>
          </Flex>
        </BrightPanel>

        <Box bg="bg2" flex={1} padding={7}>
          <Typography variant="h3" mb={2}>
            {selectedPair.pair} liquidity pool
          </Typography>
          <Typography mb={5} lineHeight={'25px'}>
            Earn Balance Tokens every day you supply liquidity. Your assets will be locked for the first 24 hours, and
            your supply ratio will fluctuate with the price.
          </Typography>

          <Flex flexWrap="wrap">
            <Box
              width={[1, 1 / 2]} //
              sx={{
                borderBottom: ['1px solid rgba(255, 255, 255, 0.15)', 0], //
                borderRight: [0, '1px solid rgba(255, 255, 255, 0.15)'],
              }}
            >
              <StyledDL>
                <dt>Your supply</dt>
                <dd>
                  9,000 {selectedPair.baseCurrencyKey} / 2,160 {selectedPair.quoteCurrencyKey}
                </dd>
              </StyledDL>
              <StyledDL>
                <dt>Your daily rewards</dt>
                <dd>~120 BALN</dd>
              </StyledDL>
            </Box>
            <Box width={[1, 1 / 2]}>
              <StyledDL>
                <dt>Total supply</dt>
                <dd>
                  500,000 {selectedPair.baseCurrencyKey} / 400,000 {selectedPair.quoteCurrencyKey}
                </dd>
              </StyledDL>
              <StyledDL>
                <dt>Total daily rewards</dt>
                <dd>~17,500 BALN</dd>
              </StyledDL>
            </Box>
          </Flex>
        </Box>
      </SectionPanel>

      <Modal isOpen={showSupplyConfirm} onDismiss={handleSupplyConfirmDismiss}>
        <Flex flexDirection="column" alignItems="stretch" m={5} width="100%">
          <Typography textAlign="center" mb="5px" as="h3" fontWeight="normal">
            Supply liquidity?
          </Typography>

          <Typography variant="p" textAlign="center" mb={4}>
            Send each asset to the pool, <br />
            then click Supply
          </Typography>

          <Flex alignItems="center" mb={4}>
            <Box width={1 / 2}>
              <Typography variant="p" fontWeight="bold" textAlign="right">
                0 {selectedPair.baseCurrencyKey}
              </Typography>
            </Box>
            <Box width={1 / 2}>
              <SupplyButton ml={3}>Send</SupplyButton>
            </Box>
          </Flex>

          <Flex alignItems="center" mb={4}>
            <Box width={1 / 2}>
              <Typography variant="p" fontWeight="bold" textAlign="right">
                0 {selectedPair.quoteCurrencyKey}
              </Typography>
            </Box>
            <Box width={1 / 2}>
              <SupplyButton ml={3}>Send</SupplyButton>
            </Box>
          </Flex>

          <Typography textAlign="center">
            Your ICX will be staked, and your
            <br />
            assets will be locked for 24 hours.
          </Typography>

          <Flex justifyContent="center" mt={4} pt={4} className="border-top">
            <TextButton onClick={handleSupplyConfirmDismiss}>Cancel</TextButton>
            <Button>Supply</Button>
          </Flex>
        </Flex>
      </Modal>
    </>
  );
}