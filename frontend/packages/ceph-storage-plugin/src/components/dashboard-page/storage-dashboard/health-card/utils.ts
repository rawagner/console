import * as _ from 'lodash';
import { HealthState } from '@console/internal/components/dashboard/health-card/states';
import { PrometheusResponse } from '@console/internal/components/graphs';
import { HealthHandler } from '@console/plugin-sdk';

const CephHealthStatus = [
  {
    state: HealthState.OK,
  },
  {
    state: HealthState.WARNING,
  },
  {
    state: HealthState.ERROR,
  },
  {
    state: HealthState.UNKNOWN,
  },
];

export const getCephHealthState: HealthHandler<PrometheusResponse> = (ocsResponse, error) => {
  if (error) {
    return CephHealthStatus[3];
  }
  if (!ocsResponse) {
    return { state: HealthState.LOADING };
  }

  const value = _.get(ocsResponse, 'data.result[0].value[1]');
  return CephHealthStatus[value] || CephHealthStatus[3];
};
