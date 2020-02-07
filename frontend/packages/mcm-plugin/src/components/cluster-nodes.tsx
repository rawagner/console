import * as React from 'react';
import { Link } from 'react-router-dom';
import { referenceForModel } from '@console/internal/module/k8s';
import { resourcePath } from '@console/internal/components/utils';
import { getName, getNamespace } from '@console/shared';
import { ClusterModel } from '../models';
import { DetailsItem } from './details-item';
import { prefixedID, getBasicID } from '../selectors';
import { ClusterKind, ClusterStatusKind } from '../types';

export const ClusterNodes: React.FC<ClusterNodesProps> = ({ cluster, clusterStatus, isCompact = false }) => {
  const nodesCount =
    clusterStatus &&
    clusterStatus.spec &&
    clusterStatus.spec.capacity &&
    clusterStatus.spec.capacity.nodes;
  const nodesLink = `${resourcePath(
    referenceForModel(ClusterModel),
    getName(cluster),
    getNamespace(cluster),
  )}/nodes`;

  return isCompact ? (
    <Link to={nodesLink}>{nodesCount}</Link>
  ) : (
    <DetailsItem
    title="Nodes"
    idValue={prefixedID(getBasicID(cluster), 'nodes-count')}
    isNotAvail={!nodesCount}
  >
    <Link to={nodesLink}>{nodesCount}</Link>
  </DetailsItem>
  );
};

type ClusterNodesProps = {
  cluster: ClusterKind;
  clusterStatus?: ClusterStatusKind;
  isCompact? : boolean;
};
