import * as React from 'react';
import {
  DashboardCardTitle,
  DashboardCard,
  DashboardCardHeader,
  DashboardCardBody,
} from '../dashboard/dashboard-card';
import { K8sResourceKind } from '../../module/k8s';
import { HealthBody } from '../dashboard/status-card/health-body';
import { AlertsBody } from '../dashboard/status-card/status-body';
import { Status } from '@console/shared';

export const StatusCard: React.FC<StatusCardProps> = ({ obj }) => (
  <DashboardCard>
    <DashboardCardHeader>
      <DashboardCardTitle>Status</DashboardCardTitle>
    </DashboardCardHeader>
    <DashboardCardBody>
      <HealthBody>
        <Status status={obj.status.phase} />
      </HealthBody>
      <AlertsBody isLoading={false} error={false} emptyMessage="No project messages" />
    </DashboardCardBody>
  </DashboardCard>
);

type StatusCardProps = {
  obj: K8sResourceKind;
};
