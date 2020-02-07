import * as React from 'react';
import { SuccessStatus } from '@console/shared';
import { ClusterKind, ClusterCondition, ClusterConditionTypes } from '../types';
import { getConditions } from '../selectors';

// TODO: check operator sources for all options here!
const getStatusCondition = (conditions: ClusterCondition[]) =>
  !conditions || conditions.length === 0 ? undefined : conditions[0];

// Is ClusterStatus CR needed here?
export const ClusterStatus: React.FC<ClusterStatusProps> = ({ cluster }) => {
  const conditions = getConditions(cluster);
  const statusCondition = getStatusCondition(conditions);
  const statusConditionType = (statusCondition || {}).type || '';
  switch (statusConditionType) {
    case ClusterConditionTypes.OK:
      return <SuccessStatus title="Ready" />;
    default:
      // eslint-disable-next-line no-console
      console.warn('Unhandled cluster status condition type: ', statusCondition);
      return <>{statusConditionType}</>;
  }
};

type ClusterStatusProps = {
  cluster: ClusterKind;
};
