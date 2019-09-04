import * as React from 'react';
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardLink,
  DashboardCardBody,
} from '../dashboard/dashboard-card';
import { ActivityBody, RecentEventsBody } from '../dashboard/activity-card/activity-body';
import {
  DashboardItemProps,
  withDashboardResources,
} from '../dashboards-page/with-dashboard-resources';
import { FirehoseResource, FirehoseResult } from '../utils';
import { EventModel } from '../../models';
import { EventKind } from '../../module/k8s';

const getEventsResource = (projectName: string): FirehoseResource => ({
  isList: true,
  kind: EventModel.kind,
  prop: 'events',
  namespace: projectName,
});

const RecentEvent = withDashboardResources(
  ({ watchK8sResource, stopWatchK8sResource, resources, projectName }: RecentEventProps) => {
    React.useEffect(() => {
      const eventsResource = getEventsResource(projectName);
      watchK8sResource(eventsResource);
      return () => {
        stopWatchK8sResource(eventsResource);
      };
    }, [watchK8sResource, stopWatchK8sResource, projectName]);
    return <RecentEventsBody events={resources.events as FirehoseResult<EventKind[]>} />;
  },
);

export const ActivityCard: React.FC<ActivityCardProps> = ({ projectName }) => (
  <DashboardCard>
    <DashboardCardHeader>
      <DashboardCardTitle>Activity</DashboardCardTitle>
      <DashboardCardLink to="/k8s/all-namespaces/events">View events</DashboardCardLink>
    </DashboardCardHeader>
    <DashboardCardBody>
      <ActivityBody>
        <RecentEvent projectName={projectName} />
      </ActivityBody>
    </DashboardCardBody>
  </DashboardCard>
);

type RecentEventProps = DashboardItemProps & {
  projectName: string;
};

type ActivityCardProps = {
  projectName: string;
};
