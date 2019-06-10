import { get } from 'lodash-es';

import { SubsystemHealth } from '@console/internal/components/dashboards-page/overview-dashboard/health-card';
import { HealthState } from '@console/internal/components/dashboard/health-card/states';
import { getBrandingDetails } from '../../../branding';

export const getKubeVirtHealth = (response: JSON): SubsystemHealth => {
  if (!response) {
    return { state: HealthState.LOADING };
  }
  return get(response, 'apiserver.connectivity') === 'ok'
    ? { message: `${getBrandingDetails()} is healthy`, state: HealthState.OK }
    : { message: `${getBrandingDetails()} is in an error state`, state: HealthState.ERROR };
};
