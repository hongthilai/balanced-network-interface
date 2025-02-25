import React from 'react';

import { defineMessage, Trans } from '@lingui/macro';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import { Flex } from 'rebass/styled-components';

import { Typography } from 'app/theme';
import { ReactComponent as CalendarIcon } from 'assets/icons/calendar.svg';
import { ReactComponent as FailureIcon } from 'assets/icons/failure.svg';
import { ReactComponent as TickIcon } from 'assets/icons/tick.svg';
import { usePlatformDayQuery } from 'queries/reward';
import { formatTimeStr } from 'utils/timeformat';

dayjs.extend(utc);
dayjs.extend(relativeTime);

const StatusMap = {
  Pending: defineMessage({ message: `Pending` }),
  Active: defineMessage({ message: `Active` }),
  Cancelled: defineMessage({ message: `Cancelled` }),
  Defeated: defineMessage({ message: `Rejected` }),
  Succeeded: defineMessage({ message: `Approved` }),
  'No Quorum': defineMessage({ message: `Quorum not reached` }),
  Executed: defineMessage({ message: `Enacted` }),
  'Failed Execution': defineMessage({ message: `Failed to enact` }),
};

interface ProposalStatusProps {
  status: string;
  startDay: number;
  endDay: number;
}

export function ProposalStatusIcon(props: ProposalStatusProps) {
  const { status, startDay, endDay } = props;
  const platformDayQuery = usePlatformDayQuery();
  const platformDay = platformDayQuery.data;

  const startTimeStr = platformDay && startDay > platformDay ? formatTimeStr(startDay, platformDay) : '';

  const endTimeStr = platformDay ? formatTimeStr(endDay, platformDay) : '';

  const isActive = platformDay ? startDay <= platformDay && platformDay < endDay : false;

  if (status === 'Defeated' || status === 'No Quorum' || status === 'Failed Execution' || status === 'Cancelled') {
    return (
      <Flex alignItems="center" sx={{ columnGap: '10px' }}>
        <FailureIcon height="22" width="22" />
        <Typography variant="content" color="white">
          <Trans id={StatusMap[status].id} />
        </Typography>
      </Flex>
    );
  }

  if ((status === 'Pending' || status === 'Confirmed') && !!startTimeStr) {
    return (
      <Flex alignItems="center" sx={{ columnGap: '10px' }}>
        <CalendarIcon height="22" width="22" />
        <Typography variant="content" color="white">
          <Trans>{`Starting in ${startTimeStr}`}</Trans>
        </Typography>
      </Flex>
    );
  }

  if (status === 'Active') {
    if (isActive && !!endTimeStr) {
      return (
        <Flex alignItems="center" sx={{ columnGap: '10px' }}>
          <CalendarIcon height="22" width="22" />
          <Typography variant="content" color="white">
            <Trans>{`${endTimeStr} left`}</Trans>
          </Typography>
        </Flex>
      );
    } else if (!!startTimeStr) {
      return (
        <Flex alignItems="center" sx={{ columnGap: '10px' }}>
          <CalendarIcon height="22" width="22" />
          <Typography variant="content" color="white">
            <Trans>{`Starting in ${startTimeStr}`}</Trans>
          </Typography>
        </Flex>
      );
    }
  }

  if (status === 'Succeeded' || status === 'Executed') {
    return (
      <Flex alignItems="center" sx={{ columnGap: '10px' }}>
        <TickIcon height="22" width="22" />
        <Typography variant="content" color="white">
          <Trans id={StatusMap[status].id} />
        </Typography>
      </Flex>
    );
  }

  return (
    <Flex alignItems="center">
      <Typography variant="content" color="white">
        <Trans id={StatusMap[status].id} />
      </Typography>
    </Flex>
  );
}
