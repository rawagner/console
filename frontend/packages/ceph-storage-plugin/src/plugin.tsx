import * as React from 'react';
import * as _ from 'lodash-es';

import {
  Plugin,
  ModelFeatureFlag,
  ModelDefinition,
  DashboardsOverviewHealthPrometheusSubsystem,
  HrefNavItem,
  RoutePage,
} from '@console/plugin-sdk';

import * as models from './models';

type ConsumedExtensions =
  | RoutePage
  | HrefNavItem
  | ModelFeatureFlag
  | ModelDefinition
  | DashboardsOverviewHealthPrometheusSubsystem;

import { getCephHealth } from './components/dashboards/health/health-card';

import { StorageDashboard } from './components/dashboards/storage-dashboard';

const CEPH_FLAG = 'CEPH';

const plugin: Plugin<ConsumedExtensions> = [
  {
    type: 'ModelDefinition',
    properties: {
      models: _.values(models),
    },
  },
  {
    type: 'FeatureFlag/Model',
    properties: {
      model: models.CephClusterModel,
      flag: CEPH_FLAG,
    },
  },
  {
    type: 'NavItem/Href',
    properties: {
      section: 'Home',
      componentProps: {
        name: 'Ceph dashboard',
        href: '/storage-dashboard',
      },
    },
  },
  {
    type: 'Dashboards/Overview/Health/Prometheus',
    properties: {
      title: 'Ceph Health',
      query: 'ceph_health_status',
      healthHandler: getCephHealth,
    },
  },
  {
    type: 'Page/Route',
    properties: {
      exact: true,
      path: '/storage-dashboard',
      render: () => <StorageDashboard />,
    },
  },
];

export default plugin;
