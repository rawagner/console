import * as _ from 'lodash';
import * as React from 'react';
import DashboardCard from '@console/shared/src/components/dashboard/dashboard-card/DashboardCard';
import DashboardCardBody from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardBody';
import DashboardCardHeader from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardHeader';
import DashboardCardLink from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardLink';
import DashboardCardTitle from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardTitle';
import DetailsBody from '@console/shared/src/components/dashboard/details-card/DetailsBody';
import DetailItem from '@console/shared/src/components/dashboard/details-card/DetailItem';
import { getName } from '@console/shared/src/selectors/common';
import { getRequester } from '@console/shared/src/selectors/namespace';
import { ProjectModel } from '../../../models';
import { ProjectDashboardContext } from './project-dashboard-context';
import { resourcePathFromModel } from '../../utils/resource-link';
import { LabelList } from '../../utils/label-list';

export const DetailsCard: React.FC = () => {
  const { obj } = React.useContext(ProjectDashboardContext);
  const keys = _.keys(obj.metadata.labels).sort();
  const labelsSubset = _.take(keys, 3);
  const firstThreelabels = _.pick(obj.metadata.labels, labelsSubset);
  const detailsLink = `${resourcePathFromModel(ProjectModel, obj.metadata.name)}/details`;
  return (
    <DashboardCard data-test-id="details-card">
      <DashboardCardHeader>
        <DashboardCardTitle>Details</DashboardCardTitle>
        <DashboardCardLink to={detailsLink}>View all</DashboardCardLink>
      </DashboardCardHeader>
      <DashboardCardBody>
        <DetailsBody>
          <DetailItem isLoading={!obj} title="Name">
            {getName(obj)}
          </DetailItem>
          <DetailItem isLoading={!obj} title="Requester">
            {getRequester(obj) || <span className="text-muted">No requester</span>}
          </DetailItem>
          <DetailItem isLoading={!obj} title="Labels">
            <div className="co-project-dashboard__details-labels">
              <LabelList kind={ProjectModel.kind} labels={firstThreelabels} />
              {keys.length > 3 && <DashboardCardLink to={detailsLink}>View all</DashboardCardLink>}
            </div>
          </DetailItem>
        </DetailsBody>
      </DashboardCardBody>
    </DashboardCard>
  );
};
