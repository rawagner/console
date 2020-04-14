import * as React from 'react';
import * as _ from 'lodash';
import DashboardCard from '@console/shared/src/components/dashboard/dashboard-card/DashboardCard';
import DashboardCardHeader from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardHeader';
import DashboardCardTitle from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardTitle';
import DashboardCardLink from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardLink';
import DashboardCardBody from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardBody';
import ActivityBody, {
  RecentEventsBody,
  OngoingActivityBody,
} from '@console/shared/src/components/dashboard/activity-card/ActivityBody';
import { EventModel, NodeModel } from '@console/internal/models';
import { EventKind, NodeKind, K8sResourceCommon } from '@console/internal/module/k8s';
import { resourcePathFromModel } from '@console/internal/components/utils';
import {
  useK8sWatchResource,
  useK8sWatchResources,
} from '@console/internal/components/utils/k8s-watch-hook';

import { NodeDashboardContext } from './NodeDashboardContext';
import {
  useExtensions,
  DashboardsNodeResourceActivity,
  isDashboardsNodeResourceActivity,
} from '@console/plugin-sdk';

const eventsResource = {
  isList: true,
  kind: EventModel.kind,
};

const nodeEventsFilter = (event: EventKind, uid: string, kind: string, name: string): boolean => {
  const { uid: objectUID, kind: objectKind, name: objectName } = event?.involvedObject || {};
  return objectUID === uid && objectKind === kind && objectName === name;
};

const RecentEvent: React.FC<RecentEventProps> = ({ node }) => {
  const [data, loaded, loadError] = useK8sWatchResource<EventKind[]>(eventsResource);
  const { uid, name } = node.metadata;
  const eventsFilter = React.useCallback(
    (event) => nodeEventsFilter(event, uid, NodeModel.kind, name),
    [uid, name],
  );
  return <RecentEventsBody events={{ data, loaded, loadError }} filter={eventsFilter} />;
};

const OngoingActivity: React.FC = () => {
  const { obj } = React.useContext(NodeDashboardContext);
  const extensions = useExtensions<DashboardsNodeResourceActivity>(
    isDashboardsNodeResourceActivity,
  );
  const resources = extensions.reduce((acc, curr, index) => {
    acc[index] = curr.properties.getResource(obj.metadata.name);
    return acc;
  }, {});
  const resourcesResult = useK8sWatchResources<{ [key: string]: K8sResourceCommon[] }>(resources);
  const activities = _.flatten(
    extensions.map((e, index) =>
      resourcesResult[index].data
        .filter((r) => (e.properties.isActivity ? e.properties.isActivity(r) : true))
        .map((r) => ({
          resource: r,
          timestamp: e.properties.getTimestamp ? e.properties.getTimestamp(r) : null,
          loader: e.properties.loader,
        })),
    ),
  );
  return (
    <OngoingActivityBody
      loaded={Object.values(resourcesResult).every((r) => r.loaded)}
      resourceActivities={activities}
    />
  );
};

const ActivityCard: React.FC = () => {
  const { obj } = React.useContext(NodeDashboardContext);
  const eventsLink = `${resourcePathFromModel(NodeModel, obj.metadata.name)}/events`;
  return (
    <DashboardCard gradient data-test-id="activity-card">
      <DashboardCardHeader>
        <DashboardCardTitle>Activity</DashboardCardTitle>
        <DashboardCardLink to={eventsLink}>View events</DashboardCardLink>
      </DashboardCardHeader>
      <DashboardCardBody>
        <ActivityBody className="co-project-dashboard__activity-body">
          <OngoingActivity />
          <RecentEvent node={obj} />
        </ActivityBody>
      </DashboardCardBody>
    </DashboardCard>
  );
};

type RecentEventProps = {
  node: NodeKind;
};

export default ActivityCard;
