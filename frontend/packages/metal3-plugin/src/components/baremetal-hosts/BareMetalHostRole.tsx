import * as React from 'react';
import { DASH } from '@console/shared/src/constants/ui';
import { getNodeRoles } from '@console/shared/src/selectors/node';
import { getMachineRole } from '@console/shared/src/selectors/machine';
import { MachineKind, NodeKind } from '@console/internal/module/k8s/types';

type BareMetalHostRoleProps = {
  machine?: MachineKind;
  node?: NodeKind;
};

const BareMetalHostRole: React.FC<BareMetalHostRoleProps> = ({ machine, node }) => (
  <>
    {getNodeRoles(node)
      .sort()
      .join(', ') ||
      getMachineRole(machine) ||
      DASH}
  </>
);

export default BareMetalHostRole;
