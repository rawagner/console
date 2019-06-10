import * as React from 'react';

import { Dashboard, DashboardGrid } from '@console/internal/components/dashboard/';
import { HealthCard } from './health/health-card';

export const StorageDashboard: React.FC<{}> = () => {
  const mainCards = [
    <HealthCard key="health" />,
  ];

  return (
    <Dashboard>
      <DashboardGrid mainCards={mainCards} />
    </Dashboard>
  );
};
