import { OK_STATE } from '@console/internal/components/dashboard/health-card';
import { GetHealthStateFunction } from '@console/internal/components/dashboards-page/overview-dashboard/health-card';

export const getFooHealthState: GetHealthStateFunction = () => ({
  message: 'Foo is healthy',
  state: OK_STATE,
});
