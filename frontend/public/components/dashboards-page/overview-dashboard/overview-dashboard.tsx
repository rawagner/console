import * as React from 'react';

import { Dashboard, DashboardGrid } from '../../dashboard';
import { HealthCard } from './health-card';
import { DetailsCard } from './details-card';
import { EventsCard } from './events-card';

export const OverviewDashboard: React.FC<{}> = () => {
  const mainCards = [
    <HealthCard key="health" />,
  ];

  const leftCards = [
    <DetailsCard key="details" />,
  ];

  const rightCards = [
    <EventsCard key="events" />,
  ];

  return (
    <Dashboard>
      <DashboardGrid mainCards={mainCards} leftCards={leftCards} rightCards={rightCards} />
    </Dashboard>
  );
};
