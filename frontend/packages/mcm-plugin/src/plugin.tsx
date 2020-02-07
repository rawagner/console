import * as _ from 'lodash';
import {
  Plugin,
  ResourceListPage,
  ResourceDetailsPage,
  ModelFeatureFlag,
  ModelDefinition,
  RoutePage,
  HrefNavItem,
} from '@console/plugin-sdk';
import * as models from './models';

type ConsumedExtensions =
  | ResourceListPage
  | ResourceDetailsPage
  | ModelFeatureFlag
  | ModelDefinition
  | RoutePage
  | HrefNavItem;

export const FLAG_MCM = 'MCM';

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
      flag: FLAG_MCM, // TODO: verify that this is not matching incorrectly the second "Cluster.clusters.k8s.io" CRD
    },
  },
  {
    type: 'NavItem/Href',
    properties: {
      section: 'Home',
      componentProps: {
        name: 'Clusters',
        href: '/k8s/clusters',
      },
      mergeBefore: 'Dashboards',
    },
    flags: {
      required: [FLAG_MCM],
    },
  },
  {
    type: 'Page/Route',
    properties: {
      exact: true,
      path: `/k8s/clusters`,
      loader: () =>
        import('./components/clusters' /* webpackChunkName: "mcm" */).then((m) => m.ClustersPage),
      required: FLAG_MCM,
    },
  },
  {
    type: 'Page/Resource/Details',
    properties: {
      model: models.ClusterModel,
      loader: () =>
        import('./components/cluster-details-page' /* webpackChunkName: "mcm" */).then(
          (m) => m.ClusterDetailsPage,
        ),
    },
  },

  // {
  //   type: 'Page/Resource/List',
  //   properties: {
  //     model: models.ClusterModel,
  //     loader: () =>
  //       import('./components/clusters' /* webpackChunkName: "mcm" */).then(
  //         (m) => m.ClustersPage,
  //       ),
  //   },
  // },
];

export default plugin;
