import * as React from 'react';
import DashboardCard from '@console/shared/src/components/dashboard/dashboard-card/DashboardCard';
import DashboardCardHeader from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardHeader';
import DashboardCardTitle from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardTitle';
import DashboardCardLink from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardLink';
import DashboardCardBody from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardBody';
import HealthBody from '@console/shared/src/components/dashboard/status-card/HealthBody';
import { Gallery, GalleryItem } from '@patternfly/react-core';
import { HealthState } from '@console/shared/src/components/dashboard/status-card/states';
import HealthItem from '@console/shared/src/components/dashboard/status-card/HealthItem';
import AlertsBody from '@console/shared/src/components/dashboard/status-card/AlertsBody';

const StatusCard: React.FC = () => (
  <DashboardCard gradient>
    <DashboardCardHeader>
      <DashboardCardTitle>Status</DashboardCardTitle>
      <DashboardCardLink to="/monitoring/alerts">View alerts</DashboardCardLink>
    </DashboardCardHeader>
    <DashboardCardBody>
      <HealthBody>
        <Gallery className="co-overview-status__health" gutter="md">
          <GalleryItem>
            <HealthItem title="Hub Cluster" state={HealthState.OK} />
          </GalleryItem>
          <GalleryItem>
            <HealthItem title="Compliance" state={HealthState.OK} />
          </GalleryItem>
          <GalleryItem>
            <HealthItem title="Security" state={HealthState.OK} />
          </GalleryItem>
        </Gallery>
      </HealthBody>
      <AlertsBody isLoading={false} emptyMessage="No cluster alerts or messages" />
    </DashboardCardBody>
  </DashboardCard>
);

export default StatusCard;
