import { ClusterKind, ClusterStatusKind } from '../types';
import { OwnerReference, K8sResourceKind } from '@console/internal/module/k8s';
import { getAPIVersion, getKind, getName, getUID } from '@console/shared';
import { FirehoseResult } from '@console/internal/components/utils';

export * from './generic';

export const compareOwnerReference = (
  obj: OwnerReference,
  otherObj: OwnerReference,
  compareModelOnly?: boolean,
) => {
  if (obj === otherObj) {
    return true;
  }
  if (!obj || !otherObj) {
    return false;
  }
  const isUIDEqual = obj.uid && otherObj.uid ? compareModelOnly || obj.uid === otherObj.uid : true;
  const isNameEqual = compareModelOnly || obj.name === otherObj.name;

  // Careful: there is bug in MCM, ClusterStatus ownerReference has apiVersion of the CLusterStatus and not the Cluster
  return (
    // obj.apiVersion === otherObj.apiVersion &&
    obj.kind === otherObj.kind &&
    isNameEqual &&
    isUIDEqual
  );
};

export const getClusterStatus = (clusterStatuses: ClusterStatusKind[] = [], cluster: ClusterKind) => {
  const clusterOwnerReference = {
    apiVersion: getAPIVersion(cluster),
    kind: getKind(cluster),
    name: getName(cluster),
    uid: getUID(cluster),
  };

  return clusterStatuses.find( cs => {
    return (cs.metadata.ownerReferences || []).some( or => compareOwnerReference(or, clusterOwnerReference));
  });
};

export const getLoadedData = (
  result: FirehoseResult<K8sResourceKind | K8sResourceKind[]>,
  defaultValue = null,
) => (result && result.loaded && !result.loadError ? result.data : defaultValue);
