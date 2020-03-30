import * as React from 'react';
import Dashboard from '@console/shared/src/components/dashboard/Dashboard';
import DashboardGrid from '@console/shared/src/components/dashboard/DashboardGrid';
import { TestCard } from './test-card';

const mainCards = [{ Card: TestCard }];

export const TestDashboard: React.FC = () => (
  <Dashboard>
      <DashboardGrid
        mainCards={mainCards}
        />
  </Dashboard>
);