import {
  Plugin,
  HrefNavItem,
  ResourceNSNavItem,
  ResourceListPage,
  ResourceDetailPage,
  OverviewHealthPrometheusSubsystem,
  OverviewHealthUrlSubsystem,
} from '@console/plugin-sdk';

// TODO(vojtech): internal code needed by plugins should be moved to console-shared package
import { PodModel } from '@console/internal/models';
import { getFooHealthState } from './foo-health';

type ConsumedExtensions =
  | HrefNavItem
  | ResourceNSNavItem
  | ResourceListPage
  | ResourceDetailPage
  | OverviewHealthPrometheusSubsystem
  | OverviewHealthUrlSubsystem;

const plugin: Plugin<ConsumedExtensions> = [
  {
    type: 'NavItem/Href',
    properties: {
      section: 'Home',
      componentProps: {
        name: 'Test Href Link',
        href: '/test',
      },
    },
  },
  {
    type: 'NavItem/ResourceNS',
    properties: {
      section: 'Workloads',
      componentProps: {
        name: 'Test ResourceNS Link',
        resource: 'pods',
      },
    },
  },
  {
    type: 'ResourcePage/List',
    properties: {
      model: PodModel,
      loader: () => import('@console/internal/components/pod' /* webpackChunkName: "pod" */).then(m => m.PodsPage),
    },
  },
  {
    type: 'ResourcePage/Detail',
    properties: {
      model: PodModel,
      loader: () => import('@console/internal/components/pod' /* webpackChunkName: "pod" */).then(m => m.PodsDetailsPage),
    },
  },
  {
    type: 'Dashboards/Overview/HealthUrlSubsystem',
    properties: {
      title: 'Foo system',
      url: 'fooUrl',
      healthHandler: getFooHealthState,
    },
  },
  {
    type: 'Dashboards/Overview/HealthPrometheusSubsystem',
    properties: {
      title: 'Via prometheus',
      query: 'fooQuery',
      healthHandler: getFooHealthState,
    },
  },
];

export default plugin;
