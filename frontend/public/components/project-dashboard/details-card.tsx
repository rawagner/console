import * as React from 'react';
import {
  DashboardCardTitle,
  DashboardCard,
  DashboardCardHeader,
  DashboardCardBody,
  DashboardCardLink,
} from '../dashboard/dashboard-card';
import { DetailsBody, DetailItem } from '../dashboard/details-card';
import { getName } from '@console/shared';
import { K8sResourceKind } from '../../module/k8s';
import { LabelList, resourcePathFromModel } from '../utils';
import { ProjectModel } from '../../models';

export const DetailsCard: React.FC<DetailsCardProps> = ({ obj }) => (
  <DashboardCard>
    <DashboardCardHeader>
      <DashboardCardTitle>Details</DashboardCardTitle>
      <DashboardCardLink to={resourcePathFromModel(ProjectModel, getName(obj))}>
        View all
      </DashboardCardLink>
    </DashboardCardHeader>
    <DashboardCardBody>
      <DetailsBody>
        <DetailItem isLoading={false} title="Name">
          {getName(obj)}
        </DetailItem>
        <DetailItem isLoading={false} title="Labels">
          <LabelList kind={ProjectModel.kind} labels={obj.metadata.labels} />
        </DetailItem>
      </DetailsBody>
    </DashboardCardBody>
  </DashboardCard>
);

type DetailsCardProps = {
  obj: K8sResourceKind;
};
