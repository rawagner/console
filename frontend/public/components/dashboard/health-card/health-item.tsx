import * as React from 'react';
import { Icon } from 'patternfly-react';

import { OK_STATE, ERROR_STATE, WARNING_STATE, LOADING_STATE } from './states';
import { LoadingInline } from '../../utils';

const HealthItemIcon: React.FC<HealthItemIconProps> = ({ state }) => {
  let icon;
  let iconClassModifier;
  switch (state) {
    case OK_STATE:
      icon = 'check-circle';
      iconClassModifier = 'ok';
      break;
    case ERROR_STATE:
      icon = 'exclamation-circle';
      iconClassModifier = 'error';
      break;
    case WARNING_STATE:
    default:
      icon = 'exclamation-triangle';
      iconClassModifier = 'warning';
  }
  return (
    <div className={`co-health-card__icon co-health-card__icon--${iconClassModifier}`}>
      <Icon type="fa" name={icon} />
    </div>
  );
};

export const HealthItem: React.FC<HealthItemProps> = React.memo(({ state, message, details }) => (
  <div className="co-health-card__item">
    {state === LOADING_STATE ? <LoadingInline /> : <HealthItemIcon state={state} />}
    <div>
      {message && <span className="co-health-card__text">{message}</span>}
      {details && <div className="co-health-card__text co-health-card__subtitle">{details}</div>}
    </div>
  </div>
));

type HealthItemProps = {
  message?: string;
  details?: string;
  state?: string;
};

type HealthItemIconProps = {
  state?: string;
}
