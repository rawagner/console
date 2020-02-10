import { K8sResourceKind, K8sResourceCondition } from '@console/internal/module/k8s';

export type ClusterSpec = {
  authInfo: any;
  kubernetesApiEndpoints: any; // TODO: be more specific
};

export type ClusterStatus = {
  conditions?: any[]; // TODO: be more specific
};

export type ClusterKind = {
  spec: ClusterSpec;
  status: ClusterStatus;
} & K8sResourceKind;

export type ClusterStatusKind = {
  // TODO
} & K8sResourceKind;

export type ClusterCondition = K8sResourceCondition<ClusterConditionTypes>;

export enum ClusterConditionTypes {
  OK = 'OK',
  // TODO
}
