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
