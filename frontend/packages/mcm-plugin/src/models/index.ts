import { K8sKind } from '@console/internal/module/k8s';

// incorrect: /api/kubernetes/ apis/cluster.k8s.io/v1alpha1/clusters
// correct: /apis/clusterregistry.k8s.io/v1alpha1/namespaces/ibm-mcm-s1/clusters/ibm-mcm-s1
/*
export const ClusterModel: K8sKind = {
  abbr: 'C',
  apiGroup: 'cluster.k8s.io',
  apiVersion: 'v1alpha1',
  crd: true,
  kind: 'Cluster',
  label: 'Cluster',
  labelPlural: 'Clusters',
  namespaced: true,
  plural: 'clusters',
  id: 'cluster',
};
*/

export const ClusterModel: K8sKind = {
  kind: 'Cluster',
  label: 'Cluster',
  labelPlural: 'Clusters',
  apiGroup: 'clusterregistry.k8s.io/v1alpha1',
  apiVersion: 'v1',
  abbr: 'C',
  namespaced: true,
  crd: true,
  plural: 'clusters',
  id: 'cluster',
};
