import * as React from 'react';
import { DASH } from '@console/shared/src/constants/ui';
import { getNamespace } from '@console/shared/src/selectors/common';
import { MachineModel } from '@console/internal/models';
import { ResourceLink } from '@console/internal/components/utils/resource-link';
import { referenceForModel } from '@console/internal/module/k8s/k8s';
import { getHostMachineName } from '../../selectors';
import { BareMetalHostKind } from '../../types';

interface MachineLinkProps {
  host: BareMetalHostKind;
}

const MachineLink: React.FC<MachineLinkProps> = ({ host }) => {
  const machineName = getHostMachineName(host);
  const namespace = getNamespace(host);

  if (machineName) {
    return (
      <ResourceLink
        kind={referenceForModel(MachineModel)}
        name={machineName}
        namespace={namespace}
        title={machineName}
      />
    );
  }
  return <>{DASH}</>;
};

export default MachineLink;
