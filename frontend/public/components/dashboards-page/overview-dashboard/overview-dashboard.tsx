import * as React from 'react';

import { Dashboard, DashboardGrid } from '../../dashboard';
import { HealthCard } from './health-card';
import { DetailsCard } from './details-card';
import { CapacityCard } from './capacity-card';

export const OverviewDashboard: React.FC<{}> = () => {
  const mainCards = [
    <HealthCard key="health" />,
    <CapacityCard key="capacity" />,
  ];

  const leftCards = [
    <DetailsCard key="details" />,
  ];

  return (
    <Dashboard>
      <DashboardGrid mainCards={mainCards} leftCards={leftCards} />
    </Dashboard>
  );
};
