import { K8sResourceKind } from '@console/internal/module/k8s/types';
import { k8sKill } from '@console/internal/module/k8s/resource';
import { VirtualMachineInstanceMigrationModel } from '../../../models';

export const cancelMigration = async (vmim: K8sResourceKind) =>
  k8sKill(VirtualMachineInstanceMigrationModel, vmim);
