import * as React from 'react';
import Dashboard from '@console/shared/src/components/dashboard/Dashboard';
import DashboardGrid from '@console/shared/src/components/dashboard/DashboardGrid';
import { InventoryCard } from './inventory-card';

const mainCards = [{ Card: InventoryCard }];

export const GQLDashboard: React.FC = () => (
  <Dashboard>
    <DashboardGrid mainCards={mainCards} />
  </Dashboard>
);
