import * as React from 'react';
import * as _ from 'lodash-es';

import * as plugins from '../../../plugins';
import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '../../dashboard/dashboard-card';
import { ResourceInventoryItem } from '../../dashboard/inventory-card/inventory-item';
import { DashboardItemProps, withDashboardResources } from '../with-dashboard-resources';
import { connectToFlags, FlagsObject, WithFlagsProps } from '../../../reducers/features';
import { getFlagsForExtensions } from '../utils';
import { InventoryBody } from '../../dashboard/inventory-card/inventory-body';
import { FirehoseResult } from '../../utils';

const getItems = (flags: FlagsObject) =>
  plugins.registry.getDashboardsOverviewInventoryItems().filter(e =>
    e.properties.required ? flags[e.properties.required] : true
  );

const ClusterInventoryItem = React.memo(withDashboardResources(({
  watchK8sResource,
  stopWatchK8sResource,
  resources,
  item,
}: ClusterInventoryItemProps) => {
  React.useEffect(() => {
    watchK8sResource(item.properties.resource);
    if (item.properties.additionalResources) {
      item.properties.additionalResources.forEach(ar => watchK8sResource(ar));
    }
    return () => {
      stopWatchK8sResource(item.properties.resource);
      if (item.properties.additionalResources) {
        item.properties.additionalResources.forEach(ar => stopWatchK8sResource(ar));
      }
    };
  }, [watchK8sResource, stopWatchK8sResource, item]);

  const { prop } = item.properties.resource;
  const resourceLoaded = _.get(resources[prop], 'loaded') as FirehoseResult['loaded'];
  const resourceLoadError = _.get(resources[prop], 'loadError') as FirehoseResult['loadError'];
  const resourceData = _.get(resources[prop], 'data', []) as FirehoseResult['data'];

  let additionalResourcesLoaded = true;
  let additionalResourcesLoadError: boolean;
  let additionalResourcesData: {[key: string]: FirehoseResult['data']};
  if (item.properties.additionalResources) {
    additionalResourcesLoaded = item.properties.additionalResources.every(r =>
      _.get(resources[r.prop], 'loaded') as FirehoseResult['loaded']
    );
    additionalResourcesLoadError = item.properties.additionalResources.some(r =>
      _.get(resources[r.prop], 'loadError')
    );
    additionalResourcesData = item.properties.additionalResources.reduce((acc, cur) => {
      acc[cur.prop] = _.get(resources[cur.prop], 'data') as FirehoseResult['data'];
      return acc;
    }, {});
  }

  return (
    <ResourceInventoryItem
      isLoading={!resourceLoaded || !additionalResourcesLoaded}
      error={!!resourceLoadError || additionalResourcesLoadError}
      kind={item.properties.model}
      resources={resourceData}
      additionalResources={additionalResourcesData}
      mapper={item.properties.mapper}
      useAbbr={item.properties.useAbbr}
    />
  );
}), (prevProps, nextProps) => JSON.stringify(prevProps.item) === JSON.stringify(nextProps.item));

const InventoryCard_: React.FC<WithFlagsProps> = ({flags = {}}) => {
  const pluginItems = getItems(flags);
  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>Cluster Inventory</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardBody>
        <InventoryBody>
          {pluginItems.map((item, index) => <ClusterInventoryItem key={index} item={item} />)}
        </InventoryBody>
      </DashboardCardBody>
    </DashboardCard>
  );
};

export const InventoryCard = connectToFlags(
  ...getFlagsForExtensions(plugins.registry.getDashboardsOverviewInventoryItems()),
)(InventoryCard_);

type ClusterInventoryItemProps = DashboardItemProps & {
  item: plugins.DashboardsOverviewInventoryItem;
};
