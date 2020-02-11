import * as React from 'react';
import DashboardCard from '@console/shared/src/components/dashboard/dashboard-card/DashboardCard';
import DashboardCardHeader from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardHeader';
import DashboardCardTitle from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardTitle';
import DashboardCardBody from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardBody';
import { ClusterInventoryItem } from '@console/internal/components/dashboard/dashboards-page/cluster-dashboard/inventory-card';
import { ClusterModel, ApplicationModel } from '../../models';

const InventoryCard: React.FC = () => (
  <DashboardCard>
    <DashboardCardHeader>
      <DashboardCardTitle>Cluster Inventory</DashboardCardTitle>
    </DashboardCardHeader>
    <DashboardCardBody>
      <ClusterInventoryItem model={ClusterModel} />
      <ClusterInventoryItem model={ApplicationModel} />
    </DashboardCardBody>
  </DashboardCard>
);

export default InventoryCard;
