import * as React from 'react';
import { DetailsPage } from '@console/internal/components/factory';
import { K8sResourceKindReference, referenceForModel } from '@console/internal/module/k8s';
import { ClusterStatusModel, ClusterModel } from '../models';
import { ClusterDetails } from './cluster-details';
import { ClusterNodesPage } from './cluster-nodes-page';
import { connectToModel } from '@console/internal/kinds';
import { ResourceDetailsPageProps } from '@console/internal/components/resource-list';

const breadcrumbsForClusters = (match: any) => () => [
  {
    name: ClusterModel.labelPlural,
    path: `/clusters`,
  },
  { name: `${match.params.name} Cluster Details`, path: `${match.url}` },
];

export const ClusterDetailsPage = connectToModel((props: ClusterDetailsPageProps) => {
  const { name, namespace } = props.match.params;
  const breadcrumbsFor = React.useMemo(() => breadcrumbsForClusters(props.match), [props.match]);

  const resources = [
    {
      kind: referenceForModel(ClusterStatusModel),
      name, // ownerReference would be better ...
      namespace,
      isList: false,
      prop: 'clusterStatus',
      optional: true, // at certain states this can be mising
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

  return (
    <DetailsPage {...props} breadcrumbsFor={breadcrumbsFor} pages={pages} resources={resources} />
  );
});

type ClusterDetailsPageProps = ResourceDetailsPageProps & {
  name: string;
  namespace: string;
  kind: K8sResourceKindReference;
};
