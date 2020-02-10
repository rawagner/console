import * as React from 'react';
import { DetailsPage } from '@console/internal/components/factory';
import { K8sResourceKindReference, referenceForModel } from '@console/internal/module/k8s';
import { ClusterStatusModel } from '../models';
import { ClusterDetails } from './cluster-details';
import { ClusterNodesPage } from './cluster-nodes-page';

export const ClusterDetailsPage: React.FC<ClusterDetailsPageProps> = (props) => {
  const { name, namespace } = props;

  const resources = [
    {
      kind: referenceForModel(ClusterStatusModel),
      name, // ownerReference would be better ...
      namespace,
      isList: false,
      prop: 'clusterStatus',
      optional: false,
    },
  ];

  /*
  const dashboardPage = {
    href: '', // default landing page
    name: 'Dashboard',
    component: VMDashboard,
  };

  const overviewPage = {
    href: VM_DETAIL_OVERVIEW_HREF,
    name: 'Overview',
    component: VMDetailsFirehose,
  };

  const consolePage = {
    href: VM_DETAIL_CONSOLES_HREF,
    name: 'Consoles',
    component: VMConsoleFirehose,
  };

  const nicsPage = {
    href: VM_DETAIL_NETWORKS_HREF,
    name: 'Network Interfaces',
    component: VMNics,
  };

  const disksPage = {
    href: VM_DETAIL_DISKS_HREF,
    name: 'Disks',
    component: VMDisksFirehose,
  };
  */
  const pages = [
    {
      href: '',
      name: 'Overview',
      component: ClusterDetails,
    },
    {
      href: 'nodes',
      name: 'Nodes',
      component: ClusterNodesPage,
    },
  ];

  return <DetailsPage {...props} pages={pages} resources={resources} />;
};

type ClusterDetailsPageProps = {
  name: string;
  namespace: string;
  kind: K8sResourceKindReference;
  match: any;
};
