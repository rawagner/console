import * as React from 'react';
import { referenceForModel } from '@console/internal/module/k8s/k8s';
import { ClusterOperator } from '@console/internal/module/k8s/types';
import { ClusterOperatorModel } from '@console/internal/models';
import { ResourceLink } from '@console/internal/components/utils/resource-link';
import { OperatorRowProps } from '@console/plugin-sdk/src/typings';
import Status from '@console/shared/src/components/dashboard/status-card/StatusPopup';

const ClusterOperatorStatusRow: React.FC<OperatorRowProps<ClusterOperator>> = ({
  operatorStatus,
}) => (
  <Status value={operatorStatus.status.title} icon={operatorStatus.status.icon}>
    <ResourceLink
      kind={referenceForModel(ClusterOperatorModel)}
      name={operatorStatus.operators[0].metadata.name}
      hideIcon
      className="co-status-popup__title"
    />
  </Status>
);

export default ClusterOperatorStatusRow;
