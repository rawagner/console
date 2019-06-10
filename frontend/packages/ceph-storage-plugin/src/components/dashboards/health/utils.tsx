import { HealthState } from '@console/internal/components/dashboard/health-card/states';
import { get } from 'lodash-es';

import {
  OCS_HEALTHY,
  OCS_DEGRADED,
  OCS_ERROR,
  OCS_UNKNOWN,
} from './strings';


const OCSHealthStatus = {
  0: {
    message: OCS_HEALTHY,
    state: HealthState.OK,
  },
  1: {
    message: OCS_DEGRADED,
    state: HealthState.WARNING,
  },
  2: {
    message: OCS_ERROR,
    state: HealthState.ERROR,
  },
  3: {
    message: OCS_UNKNOWN,
    state: HealthState.ERROR,
  },
};

export const getCephHealthState = ocsResponse => {
  if (!ocsResponse) {
    return { state: HealthState.LOADING };
  }
  const value = get(ocsResponse, 'data.result[0].value[1]');
  return OCSHealthStatus[value] || OCSHealthStatus[3];
};