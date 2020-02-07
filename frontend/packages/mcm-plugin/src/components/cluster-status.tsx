import * as React from 'react';
import { ClusterKind, ClusterCondition, ClusterConditionTypes } from '../types';
import { getConditions } from '../selectors';
import { DASH } from '@console/kubevirt-plugin/integration-tests/tests/utils/consts';
import { StatusIconAndText } from '@console/shared';
import { OkIcon } from '@patternfly/react-icons';

// TODO: check operator sources for all options here!
const getStatusCondition = (conditions: ClusterCondition[]) => !conditions || conditions.length === 0 ? undefined : conditions[0];

// TODO: check ClusterStatus CR
export const ClusterStatus: React.FC<ClusterStatusProps> = ({ cluster }) => {
  const conditions = getConditions(cluster);
  const statusCondition = getStatusCondition(conditions); 
  const statusConditionType = (statusCondition || {}).type || '';
  switch (statusConditionType) {
    case ClusterConditionTypes.OK:
      return <StatusIconAndText title="OK" icon={<OkIcon />} />;
    default:
      return <>{DASH}</>
  }
};

type ClusterStatusProps = {
  cluster: ClusterKind;
};
