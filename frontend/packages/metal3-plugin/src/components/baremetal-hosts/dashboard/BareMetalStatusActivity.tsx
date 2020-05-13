import * as React from 'react';
import { getName, getNamespace } from '@console/shared/src/selectors/common';
import ActivityItem from '@console/shared/src/components/dashboard/activity-card/ActivityItem';
import { ResourceLink } from '@console/internal/components/utils/resource-link';
import { referenceForModel } from '@console/internal/module/k8s/k8s';
import { getHostPowerStatus } from '../../../selectors';
import { BareMetalHostModel } from '../../../models';
import { BareMetalHostKind } from '../../../types';

const BareMetalStatusActivity: React.FC<BareMetalStatusActivityProps> = ({ resource }) => (
  <ActivityItem>
    {getHostPowerStatus(resource)}{' '}
    <ResourceLink
      inline
      hideIcon
      kind={referenceForModel(BareMetalHostModel)}
      name={getName(resource)}
      namespace={getNamespace(resource)}
    />
  </ActivityItem>
);

export default BareMetalStatusActivity;

type BareMetalStatusActivityProps = {
  resource: BareMetalHostKind;
};
