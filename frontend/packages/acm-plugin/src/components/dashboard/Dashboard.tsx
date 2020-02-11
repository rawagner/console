import * as React from 'react';
import SharedDashboard from '@console/shared/src/components/dashboard/Dashboard';
import DashboardGrid from '@console/shared/src/components/dashboard/DashboardGrid';
import StatusCard from './StatusCard';
import UtilizationCard from './UtilizationCard';
import DetailsCard from './DetailsCard';
import InventoryCard from './InventoryCard';
import ActivityCard from './ActivityCard';
import Helmet from 'react-helmet';
import { PageHeading } from '@console/internal/components/utils/headings';

const mainCards = [{ Card: StatusCard }, { Card: UtilizationCard }];
const leftCards = [{ Card: DetailsCard }, { Card: InventoryCard }];
const rightCards = [{ Card: ActivityCard }];

const Dashboard: React.FC = () => (
  <>
    <Helmet>
      <title>Overview</title>
    </Helmet>
    <PageHeading title="Overview" />
    <SharedDashboard>
      <DashboardGrid mainCards={mainCards} leftCards={leftCards} rightCards={rightCards} />
    </SharedDashboard>
  </>
);

export default Dashboard;
