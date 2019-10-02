import * as React from 'react';
import { CogsIcon } from '@patternfly/react-icons';
import {
  Plugin,
  Perspective,
  DashboardsOverviewHealthURLSubsystem,
  DashboardsOverviewHealthPrometheusSubsystem,
} from '@console/plugin-sdk';
import { FLAGS } from '@console/internal/const';
import { referenceForModel } from '@console/internal/module/k8s';
import { ClusterVersionModel } from '@console/internal/models';
import {
  fetchK8sHealth,
  getK8sHealthState,
  getControlPlaneHealth,
} from './components/dashboards-page/status';

type ConsumedExtensions =
  | Perspective
  | DashboardsOverviewHealthURLSubsystem<any>
  | DashboardsOverviewHealthPrometheusSubsystem;

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
    type: 'Dashboards/Overview/Health/URL',
    properties: {
      title: 'Cluster',
      url: 'healthz',
      fetch: fetchK8sHealth,
      healthHandler: getK8sHealthState,
      resource: {
        kind: referenceForModel(ClusterVersionModel),
        namespaced: false,
        name: 'version',
        isList: false,
        prop: 'cv',
      },
    },
  },
  {
    type: 'Dashboards/Overview/Health/Prometheus',
    properties: {
      title: 'Control Plane',
      queries: [
        '(sum(up{job="apiserver"} == 1) / count(up{job="apiserver"})) * 100',
        '(sum(up{job="kube-controller-manager"} == 1) / count(up{job="kube-controller-manager"})) * 100',
        '(sum(up{job="scheduler"} == 1) / count(up{job="scheduler"})) * 100',
        'sum(rate(apiserver_request_count{code=~"2.."}[5m])) / sum(rate(apiserver_request_count[5m])) * 100',
      ],
      healthHandler: getControlPlaneHealth,
      popupComponent: () =>
        import(
          './components/dashboards-page/ControlPlaneStatus' /* webpackChunkName: "console-app" */
        ).then((m) => m.default),
      popupTitle: 'Control Plane status',
    },
  },
];

export default plugin;
