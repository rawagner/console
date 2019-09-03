import * as React from 'react';
import { CogsIcon } from '@patternfly/react-icons';
import { Plugin, Perspective, DashboardsOverviewInventoryItem } from '@console/plugin-sdk';
import { FLAGS } from '@console/internal/const';
import { PodModel, NodeModel, PersistentVolumeClaimModel } from '@console/internal/models';
import {
  getPodStatusGroups,
  getNodeStatusGroups,
  getPVCStatusGroups,
} from '@console/internal/components/dashboard/inventory-card/utils';

type ConsumedExtensions = Perspective | DashboardsOverviewInventoryItem;

const plugin: Plugin<ConsumedExtensions> = [
  {
    type: 'Perspective',
    properties: {
      id: 'admin',
      name: 'Administrator',
      icon: <CogsIcon />,
      getLandingPageURL: (flags) =>
        flags[FLAGS.CAN_LIST_NS] ? '/dashboards' : '/k8s/cluster/projects',
      getK8sLandingPageURL: () => '/dashboards',
      default: true,
      getImportRedirectURL: (project) => `/k8s/cluster/projects/${project}/workloads`,
    },
  },
  {
    type: 'Dashboards/Overview/Inventory/Item',
    properties: {
      resource: {
        isList: true,
        kind: NodeModel.kind,
        prop: 'nodes',
      },
      model: NodeModel,
      mapper: getNodeStatusGroups,
    },
  },
  {
    type: 'Dashboards/Overview/Inventory/Item',
    properties: {
      resource: {
        isList: true,
        kind: PodModel.kind,
        prop: 'pods',
      },
      model: PodModel,
      mapper: getPodStatusGroups,
    },
  },
  {
    type: 'Dashboards/Overview/Inventory/Item',
    properties: {
      resource: {
        isList: true,
        kind: PersistentVolumeClaimModel.kind,
        prop: 'pvcs',
      },
      model: PersistentVolumeClaimModel,
      mapper: getPVCStatusGroups,
      useAbbr: true,
    },
  },
];

export default plugin;
