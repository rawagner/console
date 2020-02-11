import * as React from 'react';
import * as _ from 'lodash';
import { DomainIcon } from '@patternfly/react-icons';
import {
  Plugin,
  ResourceListPage,
  ResourceDetailsPage,
  ModelFeatureFlag,
  ModelDefinition,
  RoutePage,
  HrefNavItem,
  Perspective,
} from '@console/plugin-sdk';
import * as models from './models';

type ConsumedExtensions =
  | ResourceListPage
  | ResourceDetailsPage
  | ModelFeatureFlag
  | ModelDefinition
  | RoutePage
  | HrefNavItem
  | Perspective;

export const FLAG_ACM = 'ACM';

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
      model: models.ClusterModel,
      flag: FLAG_ACM,
    },
  },
  {
    type: 'Perspective',
    properties: {
      id: 'acm',
      name: 'Clusters', // TODO: "Advanced Cluster Management" is too long to show
      icon: <DomainIcon />,
      getLandingPageURL: () => '/clusters',
      getK8sLandingPageURL: () => '/add',
      getImportRedirectURL: (project) => `/clusters/ns/${project}`,
    },
    flags: {
      required: [FLAG_ACM],
    },
  },
  {
    type: 'Page/Route',
    properties: {
      exact: true,
      path: `/clusters`,
      loader: () =>
        import('./components/clusters' /* webpackChunkName: "acm" */).then((m) => m.ClustersPage),
      required: FLAG_ACM,
    },
  },
  {
    type: 'Page/Resource/Details',
    properties: {
      model: models.ClusterModel,
      loader: () =>
        import('./components/cluster-details-page' /* webpackChunkName: "acm" */).then(
          (m) => m.ClusterDetailsPage,
        ),
    },
    flags: {
      required: [FLAG_ACM],
    },
  },
];

export default plugin;
