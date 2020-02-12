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
  ResourceNSNavItem,
} from '@console/plugin-sdk';
import * as models from './models';
import { referenceForModel } from '@console/internal/module/k8s';

type ConsumedExtensions =
  | ResourceListPage
  | ResourceDetailsPage
  | ModelFeatureFlag
  | ModelDefinition
  | RoutePage
  | HrefNavItem
  | Perspective
  | ResourceNSNavItem;

export const FLAG_ACM = 'ACM';
const PERSPECTIVE_ID = 'acm';

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
      id: PERSPECTIVE_ID,
      name: 'Multi-Cluster',
      icon: <DomainIcon />,
      getLandingPageURL: () => '/overview',
      getK8sLandingPageURL: () => '/overview',
      getImportRedirectURL: () => '/overview',
    },
    flags: {
      required: [FLAG_ACM],
    },
  },
  {
    type: 'Page/Resource/List',
    properties: {
      model: models.ClusterModel,
      loader: () =>
        import('./components/clusters' /* webpackChunkName: "acm" */).then((m) => m.ClustersPage),
    },
    flags: {
      required: [FLAG_ACM],
    },
  },
  {
    type: 'NavItem/Href',
    properties: {
      perspective: 'acm',
      componentProps: {
        name: 'Overview',
        href: '/overview',
      },
    },
    flags: {
      required: [FLAG_ACM],
    },
  },
  {
    type: 'NavItem/ResourceNS',
    properties: {
      perspective: PERSPECTIVE_ID,
      componentProps: {
        name: 'Clusters',
        resource: referenceForModel(models.ClusterModel),
      },
    },
    flags: {
      required: [FLAG_ACM],
    },
  },
  {
    type: 'Page/Route',
    properties: {
      perspective: PERSPECTIVE_ID,
      exact: true,
      path: `/overview`,
      loader: () =>
        import('./components/dashboard/Dashboard' /* webpackChunkName: "acm" */).then(
          (m) => m.default,
        ),
      required: [FLAG_ACM],
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
