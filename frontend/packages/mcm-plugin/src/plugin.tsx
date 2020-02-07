import * as _ from 'lodash';
import {
  Plugin,
  ResourceNSNavItem,
  ResourceListPage,
  ResourceDetailsPage,
  ModelFeatureFlag,
  ModelDefinition,
} from '@console/plugin-sdk';
import * as models from './models';

type ConsumedExtensions =
  | ResourceNSNavItem
  | ResourceListPage
  | ResourceDetailsPage
  | ModelFeatureFlag
  | ModelDefinition

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
      flag: FLAG_MCM,
    },
  },
  {
    type: 'NavItem/ResourceNS',
    properties: {
      section: 'Workloads', // TODO: change
      componentProps: {
        name: 'Clusters',
        resource: models.ClusterModel.plural,
        required: FLAG_MCM,
      },
      mergeAfter: 'Pods',
    },
  },
  {
    type: 'Page/Resource/List',
    properties: {
      model: models.ClusterModel,
      loader: () =>
        import('./components/clusters' /* webpackChunkName: "mcm" */).then(
          (m) => m.ClustersPage,
        ),
    },
  },
  // {
  //   type: 'Page/Resource/Details',
  //   properties: {
  //     model: models.ClusterModel,
  //     loader: () =>
  //       import('./components/cluster-page' /* webpackChunkName: "mcm" */).then(
  //         (m) => m.ClusterDetailsPage,
  //       ),
  //   },
  // },
];

export default plugin;
