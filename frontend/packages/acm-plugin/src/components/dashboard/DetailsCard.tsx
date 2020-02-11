import * as React from 'react';
import DashboardCard from '@console/shared/src/components/dashboard/dashboard-card/DashboardCard';
import DashboardCardHeader from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardHeader';
import DashboardCardTitle from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardTitle';
import DashboardCardBody from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardBody';
import DetailsBody from '@console/shared/src/components/dashboard/details-card/DetailsBody';
import DetailItem from '@console/shared/src/components/dashboard/details-card/DetailItem';

const DetailsCard: React.FC = () => (
  <DashboardCard>
    <DashboardCardHeader>
      <DashboardCardTitle>Details</DashboardCardTitle>
    </DashboardCardHeader>
    <DashboardCardBody>
      <DetailsBody>
        <DetailItem title="Foo" valueClassName="co-select-to-copy">
          Bar
        </DetailItem>
      </DetailsBody>
    </DashboardCardBody>
  </DashboardCard>
);

export default DetailsCard;
