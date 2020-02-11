import * as React from 'react';
import DashboardCard from '@console/shared/src/components/dashboard/dashboard-card/DashboardCard';
import DashboardCardHeader from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardHeader';
import DashboardCardTitle from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardTitle';
import DashboardCardBody from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardBody';
import ActivityBody, {
  OngoingActivityBody,
  RecentEventsBody,
} from '@console/shared/src/components/dashboard/activity-card/ActivityBody';
import { FirehoseResult } from '@console/internal/components/utils';
import { EventKind } from '@console/internal/module/k8s';

const ActivityCard: React.FC = () => (
  <DashboardCard gradient>
    <DashboardCardHeader>
      <DashboardCardTitle>Activity</DashboardCardTitle>
    </DashboardCardHeader>
    <DashboardCardBody>
      <ActivityBody className="co-overview-dashboard__activity-body">
        <OngoingActivityBody loaded resourceActivities={[]} prometheusActivities={[]} />
        <RecentEventsBody events={{ loaded: true, data: [] } as FirehoseResult<EventKind[]>} />
      </ActivityBody>
    </DashboardCardBody>
  </DashboardCard>
);

export default ActivityCard;
