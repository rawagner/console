import * as React from 'react';
import * as _ from 'lodash-es';
import {
  DashboardItemProps,
  withDashboardResources,
} from '../dashboards-page/with-dashboard-resources';
import {
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCard,
  DashboardCardBody,
} from '../dashboard/dashboard-card';
import { InventoryBody } from '../dashboard/inventory-card/inventory-body';
import {
  PodModel,
  DeploymentModel,
  PersistentVolumeClaimModel,
  ServiceModel,
  RouteModel,
} from '../../models';
import {
  ResourceInventoryItem,
  StatusGroupMapper,
} from '../dashboard/inventory-card/inventory-item';
import { getPodStatusGroups, getPVCStatusGroups } from '../dashboard/inventory-card/utils';
import { FirehoseResult, FirehoseResource } from '../utils';
import { K8sKind } from '../../module/k8s';
import { InventoryStatusGroup } from '../dashboard/inventory-card/status-group';

const createFirehoseResource = (model: K8sKind, projectName: string): FirehoseResource => ({
  kind: model.kind,
  isList: true,
  prop: 'resource',
  namespace: projectName,
});

const ProjectInventoryItem = withDashboardResources(
  ({
    projectName,
    watchK8sResource,
    stopWatchK8sResource,
    resources,
    model,
    mapper,
    useAbbr,
  }: ProjectInventoryItemProps) => {
    React.useEffect(() => {
      const resource = createFirehoseResource(model, projectName);
      watchK8sResource(resource);
      return () => stopWatchK8sResource(resource);
    }, [watchK8sResource, stopWatchK8sResource, projectName, model]);

    const resourceData = _.get(resources.resource, 'data', []) as FirehoseResult['data'];
    const resourceLoaded = _.get(resources.resource, 'loaded');
    const resourceLoadError = _.get(resources.resource, 'loadError');
    return (
      <ResourceInventoryItem
        kind={model}
        isLoading={!resourceLoaded}
        namespace={projectName}
        error={!!resourceLoadError}
        resources={resourceData}
        mapper={mapper}
        useAbbr={useAbbr}
      />
    );
  },
);

const dummyMapper = (resources) => ({
  [InventoryStatusGroup.WARN]: {
    statusIDs: [],
    count: resources.length,
  },
});

export const InventoryCard: React.FC<InventoryCardProps> = ({ projectName }) => {
  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>Inventory</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardBody>
        <InventoryBody>
          <ProjectInventoryItem
            projectName={projectName}
            model={DeploymentModel}
            mapper={dummyMapper}
          />
          <ProjectInventoryItem
            projectName={projectName}
            model={PodModel}
            mapper={getPodStatusGroups}
          />
          <ProjectInventoryItem
            projectName={projectName}
            model={PersistentVolumeClaimModel}
            mapper={getPVCStatusGroups}
            useAbbr
          />
          <ProjectInventoryItem
            projectName={projectName}
            model={ServiceModel}
            mapper={dummyMapper}
          />
          <ProjectInventoryItem projectName={projectName} model={RouteModel} mapper={dummyMapper} />
        </InventoryBody>
      </DashboardCardBody>
    </DashboardCard>
  );
};

type InventoryCardProps = {
  projectName: string;
};

type ProjectInventoryItemProps = DashboardItemProps & {
  projectName: string;
  model: K8sKind;
  mapper: StatusGroupMapper;
  useAbbr?: boolean;
};
