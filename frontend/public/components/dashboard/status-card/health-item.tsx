import * as React from 'react';
import classNames from 'classnames';

import {
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
  YellowExclamationTriangleIcon,
} from '@console/shared';
import {
  UnknownIcon,
  SyncAltIcon,
} from '@patternfly/react-icons';
import { HealthState } from '../health-card/states';

const healthStateMapping = {
  [HealthState.OK]: {
    icon: <GreenCheckCircleIcon />,
  },
  [HealthState.ERROR]: {
    icon: <RedExclamationCircleIcon />,
  },
  [HealthState.WARNING]: {
    icon: <YellowExclamationTriangleIcon />,
  },
  [HealthState.UPDATING]: {
    icon: <SyncAltIcon className="update-pending" />,
    message: 'Updating',
  },
  [HealthState.UNKNOWN]: {
    icon: <UnknownIcon className="text-secondary" />,
    message: 'Not available',
  },
};

const HealthItemIcon: React.FC<HealthItemIconProps> = ({ state }) => (
  <div className="co-dashboard-icon">
    {(healthStateMapping[state] || healthStateMapping[HealthState.UNKNOWN]).icon}
  </div>
);

export const HealthItem: React.FC<HealthItemProps> = React.memo(
  ({ className, state, title, details }) => {
    const detailMessage = details || (healthStateMapping[state] || healthStateMapping[HealthState.UNKNOWN]).message;
    return (
      <div className={classNames('co-health-card__item', className)}>
        {state === HealthState.LOADING ? <div className="skeleton-health" /> : <HealthItemIcon state={state} />}
        <div>
          <span className="co-dashboard-text--small co-health-card__text">{title}</span>
          {state !== HealthState.LOADING && detailMessage && (
            <div className="co-dashboard-text--small co-health-card__text co-health-card__subtitle">
              {detailMessage}
            </div>
          )}
        </div>
      </div>
    );
  }
);

type HealthItemProps = {
  className?: string;
  title: string;
  details?: string;
  state?: HealthState;
};

type HealthItemIconProps = {
  state?: HealthState;
};
