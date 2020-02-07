import { K8sResourceKind } from "@console/internal/module/k8s";
import { ClusterCondition } from "../types";

export const getLabelValue = (entity: K8sResourceKind, label: string): string =>
  entity && entity.metadata && entity.metadata.labels && entity.metadata.labels[label] || undefined;

export const  getConditions = (entity: K8sResourceKind): ClusterCondition[] => entity && entity.status && entity.status.conditions || [];
