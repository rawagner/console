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
import { Table, TableRow, TableData, MultiListPage } from '@console/internal/components/factory';
import { FirehoseResult, Kebab, ResourceLink } from '@console/internal/components/utils';
import { referenceForModel } from '@console/internal/module/k8s';
import { ClusterModel, ClusterStatusModel } from '../models';
import { ClusterKind, ClusterStatusKind } from '../types';
import { getLabelValue, getClusterStatus, getLoadedData } from '../selectors';
import { ClusterStatus } from './cluster-status';
import { ClusterNodes } from './cluster-nodes';

const tableColumnClasses = [
  classNames('col-lg-3', 'col-md-3', 'col-sm-4', 'col-xs-4'),
  classNames('col-lg-3', 'col-md-3', 'col-sm-4', 'col-xs-4'),
  classNames('col-lg-3', 'col-md-3', 'hidden-sm', 'hidden-xs'),
  classNames('col-lg-2', 'col-md-2', 'col-sm-2', 'col-xs-2'),
  classNames('col-lg-1', 'col-md-1', 'col-sm-2', 'col-xs-2'),
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
      {
        title: 'Nodes',
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

const ClusterRow: React.FC<ClusterRowProps> = (props) => {
  const { obj: cluster, index, key, style, customData: { clusterStatuses} } = props;

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
      <TableData className={dimensify()}>
        <ClusterNodes cluster={cluster} clusterStatus={getClusterStatus(clusterStatuses, cluster)} isCompact />
      </TableData>
    </TableRow>
  );
};

const flatten = ({ clusters }) => getLoadedData(clusters, []);

const ClusterList: React.FC<React.ComponentProps<typeof Table> & ClusterListProps> = (props) => {
  const { resources, ...restProps } = props;

  return (
    <div className="mcm-cluster-list">
      <Table
        {...restProps}
        aria-label={ClusterModel.labelPlural}
        Header={ClusterHeader}
        Row={ClusterRow}
        customData={{
          clusterStatuses: getLoadedData(resources.clusterStatuses, []),
        }}
        virtualize
      />
    </div>
  );
};
ClusterList.displayName = 'ClusterList';
 
// TODO: read clusterstatus objects
// the "title" will be changed later to match context ...
export const ClustersPage: React.FC<ClustersPageProps> = (props) => {
  const resources = [
    {
      kind: referenceForModel(ClusterStatusModel),
      isList: true,
      prop: 'clusterStatuses',
      optional: false,
    },
    {
      kind: referenceForModel(ClusterModel),
      isList: true,
      prop: 'clusters',
      optional: false,
    },
  ];

  return (
    <MultiListPage
      {...props}
      namespace={undefined /* TODO: remove? */ }
      ListComponent={ClusterList}
      title="Clusters"
      resources={resources}
      flatten={flatten}
    />
  );
};

type ClusterRowProps = {
  obj: ClusterKind;
  index: number;
  key: string;
  style: object;
  customData: {
    clusterStatuses: ClusterStatusKind[];
  };
};

type ClusterListProps = {
  data: ClusterKind[];
  resources: {
    clusters: FirehoseResult<ClusterKind[]>;
    clusterStatuses: FirehoseResult<ClusterStatusKind[]>;
  };
};

type ClustersPageProps = {};
