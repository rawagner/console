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

export const ClusterStatusModel: K8sKind = {
  kind: 'ClusterStatus',
  label: 'ClusterStatus',
  labelPlural: 'ClusterStatuses',
  apiGroup: 'mcm.ibm.com',
  apiVersion: 'v1alpha1',
  abbr: 'CS',
  namespaced: true,
  crd: true,
  plural: 'clusterstatuses',
  id: '',
};

export const ApplicationModel: K8sKind = {
  kind: 'Application',
  label: 'Application',
  labelPlural: 'Applications',
  apiGroup: 'app.k8s.io',
  apiVersion: 'v1beta1',
  abbr: 'A',
  namespaced: true,
  crd: true,
  plural: 'applications',
  id: '',
};

export const PolicyModel: K8sKind = {
  kind: 'Policy',
  label: 'Policy',
  labelPlural: 'Policies',
  apiGroup: 'policy.mcm.ibm.com',
  apiVersion: 'v1alpha1',
  abbr: 'PO',
  namespaced: true,
  crd: true,
  plural: 'policies',
  id: '',
};
