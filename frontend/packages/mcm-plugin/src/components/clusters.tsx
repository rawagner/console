import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import {
  getName,
  getNamespace,
  getUID,
  dimensifyHeader,
  dimensifyRow,
  DASH,
} from '@console/shared';
import { Table, TableRow, TableData, ListPage } from '@console/internal/components/factory';
import { FirehoseResult, Kebab, ResourceLink } from '@console/internal/components/utils';
import { referenceForModel } from '@console/internal/module/k8s';
import { ClusterModel } from '../models';
import { ClusterKind } from '../types';
import { getLabelValue } from '../selectors';
import { ClusterStatus } from './cluster-status';

const tableColumnClasses = [
  classNames('col-lg-3', 'col-md-3', 'col-sm-4', 'col-xs-4'),
  classNames('col-lg-3', 'col-md-3', 'col-sm-4', 'col-xs-4'),
  classNames('col-lg-3', 'col-md-3', 'hidden-sm', 'hidden-xs'),
  classNames('col-lg-3', 'col-md-3', 'col-sm-4', 'col-xs-4'),
  Kebab.columnClass,
];

const ClusterHeader = () =>
  dimensifyHeader(
    [
      {
        title: 'Name',
        sortField: 'metadata.name',
        transforms: [sortable],
      },
      {
        title: 'Status',
        sortFunc: 'string',
        transforms: [sortable],
      },
      {
        title: 'Purpose',
        sortFunc: 'string',
        transforms: [sortable],
      },
      {
        title: 'Cloud provider',
        sortFunc: 'string',
        transforms: [sortable],
      },
      // Public service endpoint URL (aka console)
      // API endpoint
      // Namespace
      // nodes
      {
        title: '',
      },
    ],
    tableColumnClasses,
  );

const ClusterRow: React.FC<ClusterRowProps> = ({ obj: cluster, index, key, style }) => {
  const dimensify = dimensifyRow(tableColumnClasses);
  const name = getName(cluster);
  const namespace = getNamespace(cluster);
  const uid = getUID(cluster);

  const purpose = getLabelValue(cluster, 'purpose');
  const cloudProvider = getLabelValue(cluster, 'cloud');

  return (
    <TableRow id={uid} index={index} trKey={key} style={style}>
      <TableData className={dimensify()}>
        <ResourceLink
          kind={referenceForModel(ClusterModel)}
          name={name}
          namespace={namespace}
          title={name}
        />
      </TableData>
      <TableData className={dimensify()}>
        <ClusterStatus cluster={cluster} />
      </TableData>
      <TableData className={dimensify()}>{purpose || DASH}</TableData>
      <TableData className={dimensify()}>{cloudProvider || DASH}</TableData>
    </TableRow>
  );
};

const ClusterList: React.FC<React.ComponentProps<typeof Table> & ClusterListProps> = (props) => {
  return (
    <div className="mcm-cluster-list">
      <Table
        {...props}
        aria-label={ClusterModel.labelPlural}
        Header={ClusterHeader}
        Row={ClusterRow}
        virtualize
      />
    </div>
  );
};
ClusterList.displayName = 'ClusterList';

// TODO: read clusterstatus objects
// the "title" will be changed later to match context ...
export const ClustersPage: React.FC<ClustersPageProps> = (props) => {
  return (
    <ListPage
      {...props}
      kind={referenceForModel(ClusterModel)}
      namespace={undefined}
      ListComponent={ClusterList}
      title="New Projects M"
    />
  );
};

type ClusterRowProps = {
  obj: ClusterKind;
  index: number;
  key: string;
  style: object;
};

type ClusterListProps = {
  data: ClusterKind[];
  resources: {
    clusters: FirehoseResult<ClusterKind[]>;
  };
};

type ClustersPageProps = {};
