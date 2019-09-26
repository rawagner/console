import * as _ from 'lodash';
import { HealthState } from '@console/internal/components/dashboard/health-card/states';
import { HealthHandler } from '@console/plugin-sdk';
import { PrometheusResponse } from '@console/internal/components/graphs';

export const getFooHealthState: HealthHandler<any> = () => ({ state: HealthState.OK });

export const getBarHealthState: HealthHandler<PrometheusResponse[]> = (response, error, nodes) => {
  if (!response || !_.get(nodes, 'loaded')) {
    return {
      state: HealthState.LOADING,
    };
  }
  return {
    message: 'Additional message',
    state: HealthState.ERROR,
  };
};
