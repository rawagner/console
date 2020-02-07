import { K8sKind } from '@console/internal/module/k8s';

// /apis/clusterregistry.k8s.io/v1alpha1/namespaces/ibm-mcm-s1/clusters/ibm-mcm-s1

// Recent version of IBM Multi Cloud is not based on CRD but custom API extension.
// This might change in future releases.
// https://github.com/kubernetes/cluster-registry/blob/master/cluster-registry-crd.yaml
export const ClusterModel: K8sKind = {
  kind: 'Cluster',
  label: 'Cluster',
  labelPlural: 'Clusters',
  apiGroup: 'clusterregistry.k8s.io',
  apiVersion: 'v1alpha1',
  abbr: 'C',
  namespaced: true,
  crd: true,
  plural: 'clusters',
  id: '',
};
