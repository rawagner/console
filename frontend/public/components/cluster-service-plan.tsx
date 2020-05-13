import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { Table, TableRow, TableData, RowFunction } from './factory/table';
import { ListPage } from './factory/list-page';
import { DetailsPage } from './factory/details';
import { servicePlanDisplayName } from '../module/k8s/service-catalog';
import { referenceForModel } from '../module/k8s/k8s';
import { K8sResourceKind } from '../module/k8s/types';
import {
  ClusterServicePlanModel,
  ClusterServiceBrokerModel,
  ClusterServiceClassModel,
} from '../models';
import { viewYamlComponent, navFactory } from './utils/horizontal-nav';
import { ResourceLink } from './utils/resource-link';
import { SectionHeading } from './utils/headings';
import { ResourceSummary, detailsPage } from './utils/details-page';

const tableColumnClasses = [
  classNames('col-sm-4', 'col-xs-6'),
  classNames('col-sm-4', 'col-xs-6'),
  classNames('col-sm-4', 'hidden-xs'),
];

const ClusterServicePlanTableHeader = () => {
  return [
    {
      title: 'Name',
      sortField: 'metadata.name',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: 'External Name',
      sortField: 'spec.externalName',
      transforms: [sortable],
      props: { className: tableColumnClasses[1] },
    },
    {
      title: 'Broker',
      sortField: 'spec.clusterServiceBrokerName',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
  ];
};
ClusterServicePlanTableHeader.displayName = 'ClusterServicePlanTableHeader';

const ClusterServicePlanTableRow: RowFunction<K8sResourceKind> = ({
  obj: servicePlan,
  index,
  key,
  style,
}) => {
  return (
    <TableRow id={servicePlan.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink
          kind={referenceForModel(ClusterServicePlanModel)}
          name={servicePlan.metadata.name}
          displayName={servicePlan.spec.externalName}
        />
      </TableData>
      <TableData className={tableColumnClasses[1]}>{servicePlan.spec.externalName}</TableData>
      <TableData className={classNames(tableColumnClasses[2], 'co-break-word')}>
        <ResourceLink
          kind={referenceForModel(ClusterServiceBrokerModel)}
          name={servicePlan.spec.clusterServiceBrokerName}
          title={servicePlan.spec.clusterServiceBrokerName}
        />
      </TableData>
    </TableRow>
  );
};

const ClusterServicePlanDetails: React.SFC<ClusterServicePlanDetailsProps> = ({
  obj: servicePlan,
}) => {
  return (
    <div className="co-m-pane__body">
      <SectionHeading text="Service Plan Details" />
      <div className="row">
        <div className="col-md-6">
          <ResourceSummary resource={servicePlan} />
        </div>
        <div className="col-md-6">
          <dl className="co-m-pane__details">
            <dt>Description</dt>
            <dd>{servicePlan.spec.description}</dd>
            <dt>Broker</dt>
            <dd>
              <ResourceLink
                kind={referenceForModel(ClusterServiceBrokerModel)}
                name={servicePlan.spec.clusterServiceBrokerName}
              />
            </dd>
            <dt>Service Class</dt>
            <dd>
              <ResourceLink
                kind={referenceForModel(ClusterServiceClassModel)}
                name={servicePlan.spec.clusterServiceClassRef.name}
              />
            </dd>
            {servicePlan.status.removedFromBrokerCatalog && (
              <>
                <dt>Removed From Catalog</dt>
                <dd>{servicePlan.status.removedFromBrokerCatalog}</dd>
              </>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
};

export const ClusterServicePlanDetailsPage: React.SFC<ClusterServicePlanDetailsPageProps> = (
  props,
) => (
  <DetailsPage
    {...props}
    titleFunc={servicePlanDisplayName}
    kind={referenceForModel(ClusterServicePlanModel)}
    pages={[
      navFactory.details(detailsPage(ClusterServicePlanDetails)),
      navFactory.editYaml(viewYamlComponent),
    ]}
  />
);

export const ClusterServicePlanList: React.SFC = (props) => (
  <Table
    {...props}
    aria-label="Cluster Service Plans"
    Header={ClusterServicePlanTableHeader}
    Row={ClusterServicePlanTableRow}
    virtualize
  />
);

export const ClusterServicePlanPage: React.SFC<ClusterServicePlanPageProps> = (props) => (
  <ListPage
    {...props}
    ListComponent={ClusterServicePlanList}
    kind={referenceForModel(ClusterServicePlanModel)}
    textFilter="service-plan"
    canCreate={false}
  />
);

export type ClusterServicePlanPageProps = {
  showTitle?: boolean;
  fieldSelector?: string;
};

export type ClusterServicePlanDetailsProps = {
  obj: K8sResourceKind;
};

export type ClusterServicePlanDetailsPageProps = {
  match: any;
};
