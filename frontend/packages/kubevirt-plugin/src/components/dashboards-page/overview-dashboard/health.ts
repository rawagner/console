import * as _ from 'lodash';
import { HealthState } from '@console/internal/components/dashboard/health-card/states';
import { HealthHandler } from '@console/plugin-sdk';

export const getKubevirtHealthState: HealthHandler<KubevirtHealthResponse> = (response) => {
  if (!response) {
    return { state: HealthState.LOADING };
  }
  return _.get(response, 'apiserver.connectivity') === 'ok'
    ? { state: HealthState.OK }
    : { state: HealthState.ERROR };
};

type KubevirtHealthResponse = {
  apiserver: {
    connectivity: string;
  };
};
