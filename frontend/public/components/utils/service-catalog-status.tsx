import * as React from 'react';
import { Status } from '@console/shared/src/components/status/Status';

import { K8sResourceKind } from '../../module/k8s/types';
import { serviceCatalogStatus } from '../../module/k8s/service-catalog';

export const StatusWithIcon: React.SFC<StatusWithIconProps> = ({ obj }) => {
  const objStatus: string = serviceCatalogStatus(obj);
  return <Status status={objStatus} />;
};

export type StatusWithIconProps = {
  obj: K8sResourceKind;
};
