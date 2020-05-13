import * as React from 'react';
import { DASH } from '@console/shared/src/constants/ui';
import { getNodeRoles } from '@console/shared/src/selectors/node';
import { NodeKind } from '@console/internal/module/k8s/types';

type NodeRolesProps = {
  node?: NodeKind;
};

const NodeRoles: React.FC<NodeRolesProps> = ({ node }) => (
  <>
    {getNodeRoles(node)
      .sort()
      .join(', ') || DASH}
  </>
);

export default NodeRoles;
