import { OK_STATE } from '@console/internal/components/dashboard/health-card/states';
import { HealthState } from '@console/internal/components/dashboards-page/overview-dashboard/health-card';

export const getFooHealthState = (): HealthState => ({
  message: 'Foo is healthy',
  state: OK_STATE,
});
