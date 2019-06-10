import * as _ from 'lodash-es';
import {
  Plugin,
  ResourceNSNavItem,
  ResourceListPage,
  ResourceDetailsPage,
  ModelFeatureFlag,
  YAMLTemplate,
  ModelDefinition,
  DashboardsOverviewHealthURLSubsystem,
} from '@console/plugin-sdk';

import * as models from './models';
import { yamlTemplates } from './yaml-templates';
import { getBrandingDetails } from './branding';
import { getKubeVirtHealth } from './components/dashboards-page/overview-dashboard/health-card';

type ConsumedExtensions =
  | ResourceNSNavItem
  | ResourceListPage
  | ResourceDetailsPage
  | ModelFeatureFlag
  | YAMLTemplate
  | ModelDefinition
  | DashboardsOverviewHealthURLSubsystem<JSON>;

const FLAG_KUBEVIRT = 'KUBEVIRT';

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
      model: models.VirtualMachineModel,
      flag: FLAG_KUBEVIRT,
    },
  },
  {
    type: 'NavItem/ResourceNS',
    properties: {
      section: 'Workloads',
      componentProps: {
        name: 'Virtual Machines',
        resource: models.VirtualMachineModel.plural,
        required: FLAG_KUBEVIRT,
      },
      mergeAfter: 'Pods',
    },
  },
  {
    type: 'Page/Resource/List',
    properties: {
      model: models.VirtualMachineModel,
      loader: () =>
        import('./components/vm' /* webpackChunkName: "kubevirt-virtual-machines" */).then(
          (m) => m.VirtualMachinesPage,
        ),
    },
  },
  {
    type: 'YAMLTemplate',
    properties: {
      model: models.VirtualMachineModel,
      template: yamlTemplates.getIn([models.VirtualMachineModel, 'default']),
    },
  },
  {
    type: 'Dashboards/Overview/Health/URL',
    properties: {
      title: getBrandingDetails(),
      url: `apis/subresources.${models.VirtualMachineModel.apiGroup}/${
        models.VirtualMachineModel.apiVersion
      }/healthz`,
      healthHandler: getKubeVirtHealth,
    },
  },
  // {
  //   type: 'Page/Resource/Details',
  //   properties: {
  //     model: VirtualMachineModel,
  //     loader: () => import('./components/vm-detail' /* webpackChunkName: "kubevirt-virtual-machines" */).then(m => m.VirtualMachinesDetailsPage),
  //   },
  // },
];

export default plugin;
