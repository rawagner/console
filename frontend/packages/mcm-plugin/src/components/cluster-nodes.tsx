import * as React from 'react';
import { ScrollToTopOnMount, StatusBox } from '@console/internal/components/utils';
import { ClusterKind, ClusterStatusKind } from '../types';

export const ClusterNodes: React.FC<ClusterNodesProps> = (props) => {
  const { obj: cluster, clusterStatus, ...restProps } = props;

  const nodesCount =
    clusterStatus &&
    clusterStatus.spec &&
    clusterStatus.spec.capacity &&
    clusterStatus.spec.capacity.nodes;

  return (
    <StatusBox data={cluster} loaded={!!cluster} {...restProps}>
      <ScrollToTopOnMount />
      Count: {nodesCount}
      TODO: Show (In-)active nodes and some usage statistics
    </StatusBox>
  );
};

type ClusterNodesProps = {
  obj: ClusterKind;
  clusterStatus?: ClusterStatusKind;
};
