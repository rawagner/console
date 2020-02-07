import { K8sKind } from '@console/internal/module/k8s';

export const ClusterModel: K8sKind = {
  label: 'Cluster',
  labelPlural: 'Clusters',
  apiVersion: 'v1alpha1',
  apiGroup: 'cluster.k8s.io',
  plural: 'clusters',
  abbr: 'CL',
  namespaced: true,
  kind: 'Cluster',
  id: 'cluster',
  crd: true,
};
