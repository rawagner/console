import { apiVersionForModel } from '@console/internal/module/k8s/k8s';
import { MachineKind } from '@console/internal/module/k8s/types';
import { MachineSetModel } from '@console/internal/models';
import { getOwnerReferences } from '@console/shared/src/selectors/common';
import { compareOwnerReference } from '@console/shared/src/utils/owner-references';

export const getMachineMachineSetOwner = (machine: MachineKind) => {
  const desiredReference = {
    apiVersion: apiVersionForModel(MachineSetModel),
    kind: MachineSetModel.kind,
  } as any;
  return (getOwnerReferences(machine) || []).find((reference) =>
    compareOwnerReference(desiredReference, reference, true),
  );
};
