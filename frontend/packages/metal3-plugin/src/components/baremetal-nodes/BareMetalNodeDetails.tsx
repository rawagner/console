import * as React from 'react';
import { NodeKind, K8sResourceKind } from '@console/internal/module/k8s/types';
import NodeDetailsConditions from '@console/app/src/components/nodes/NodeDetailsConditions';
import NodeDetailsImages from '@console/app/src/components/nodes/NodeDetailsImages';
import { getNodeMachineName } from '@console/shared/src/selectors/node';
import { getName } from '@console/shared/src/selectors/common';
import { createBasicLookup } from '@console/shared/src/utils/utils';
import { BareMetalHostKind } from '../../types';
import { getNodeMaintenanceNodeName, getHostMachineName } from '../../selectors';
import BareMetalNodeDetailsOverview from './BareMetalNodeDetailsOverview';

type BareMetalNodeDetailsProps = {
  obj: NodeKind;
  hosts: BareMetalHostKind[];
  nodeMaintenances: K8sResourceKind[];
};

const BareMetalNodeDetails: React.FC<BareMetalNodeDetailsProps> = ({
  obj: node,
  hosts,
  nodeMaintenances,
}) => {
  const maintenancesByNodeName = createBasicLookup(nodeMaintenances, getNodeMaintenanceNodeName);
  const hostsByMachineName = createBasicLookup(hosts, getHostMachineName);
  const host = hostsByMachineName[getNodeMachineName(node)];
  const nodeMaintenance = maintenancesByNodeName[getName(node)];
  return (
    <>
      <BareMetalNodeDetailsOverview node={node} host={host} nodeMaintenance={nodeMaintenance} />
      <NodeDetailsConditions node={node} />
      <NodeDetailsImages node={node} />
    </>
  );
};

export default BareMetalNodeDetails;
