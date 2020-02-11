import { K8sResourceKind } from '@console/internal/module/k8s';
import { getNamespace, getName } from '@console/shared';
import { ClusterCondition } from '../types';

export const getLabelValue = (entity: K8sResourceKind, label: string): string =>
  entity?.metadata?.labels[label] || undefined;

export const getConditions = (entity: K8sResourceKind): ClusterCondition[] =>
  entity?.status?.conditions || [];

export const getBasicID = <A extends K8sResourceKind = K8sResourceKind>(entity: A) =>
  `${getNamespace(entity)}-${getName(entity)}`;

export const prefixedID = (idPrefix: string, id: string) =>
  idPrefix && id ? `${idPrefix}-${id}` : null;
