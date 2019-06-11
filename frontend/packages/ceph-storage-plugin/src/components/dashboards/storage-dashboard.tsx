import * as React from 'react';

import { Dashboard } from '@console/internal/components/dashboard/dashboard';
import { DashboardGrid } from '@console/internal/components/dashboard/grid';

const Empty = () => null;

export const StorageDashboard: React.FC<{}> = () => {
  const mainCards = [
    <Empty />
  ];

  return (
    <Dashboard>
      <DashboardGrid mainCards={mainCards} />
    </Dashboard>
  );
};
