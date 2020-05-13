import { K8sResourceKind } from '@console/internal/module/k8s/types';

export type WatchCephResource = {
  ceph: K8sResourceKind[];
};
