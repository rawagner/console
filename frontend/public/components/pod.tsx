import * as React from 'react';
// FIXME upgrading redux types is causing many errors at this time
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { sortable } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import * as classNames from 'classnames';
import * as _ from 'lodash-es';
import { Button, Popover } from '@patternfly/react-core';
import { Status, TableColumnsType, useUserSettingsCompatibility } from '@console/shared';
import { ByteDataTypes } from '@console/shared/src/graph-helper/data-utils';
import {
  withUserSettingsCompatibility,
  WithUserSettingsCompatibilityProps,
} from '@console/shared/src/hoc/withUserSettingsCompatibility';
import {
  COLUMN_MANAGEMENT_CONFIGMAP_KEY,
  COLUMN_MANAGEMENT_LOCAL_STORAGE_KEY,
} from '@console/shared/src/constants/common';
import * as UIActions from '../actions/ui';
import { coFetchJSON } from '../co-fetch';
import { ContainerSpec, K8sResourceKindReference, PodKind, referenceForModel } from '../module/k8s';
import {
  getRestartPolicyLabel,
  podPhase,
  podPhaseFilterReducer,
  podReadiness,
  podRestarts,
} from '../module/k8s/pods';
import { getContainerState, getContainerStatus } from '../module/k8s/container';
import { ResourceEventStream } from './events';
import { DetailsPage, TableRow, TableData } from './factory';
import ListPageBody from './factory/ListPage/ListPageBody';
import ListPageHeader from './factory/ListPage/ListPageHeader';
import ListPageFilter from './factory/ListPage/ListPageFilter';
import ListPageCreate from './factory/ListPage/ListPageCreate';
import {
  AsyncComponent,
  DetailsItem,
  Kebab,
  NodeLink,
  OwnerReferences,
  ResourceIcon,
  ResourceKebab,
  ResourceLink,
  ResourceSummary,
  ScrollToTopOnMount,
  SectionHeading,
  Timestamp,
  formatBytesAsMiB,
  formatCores,
  humanizeBinaryBytes,
  humanizeDecimalBytesPerSec,
  humanizeCpuCores,
  navFactory,
  units,
  LabelList,
  RuntimeClass,
} from './utils';
import { PodLogs } from './pod-logs';
import {
  Area,
  Stack,
  PROMETHEUS_BASE_PATH,
  PROMETHEUS_TENANCY_BASE_PATH,
  requirePrometheus,
  PrometheusResult,
} from './graphs';
import { VolumesTable } from './volumes-table';
import { PodModel } from '../models';
import { Conditions } from './conditions';
import { useK8sWatchResource } from './utils/k8s-watch-hook';
import { useListPageFilter } from './factory/ListPage/filter-hook';
import VirtualizedTable, { RowProps, TableColumn } from './factory/Table/VirtualizedTable';
import { TFunction } from 'i18next';
import { sortResourceByValue } from './factory/Table/sort';

// Only request metrics if the device's screen width is larger than the
// breakpoint where metrics are visible.
const showMetrics =
  PROMETHEUS_BASE_PATH && PROMETHEUS_TENANCY_BASE_PATH && window.screen.width >= 1200;

const fetchPodMetrics = (namespace: string): Promise<UIActions.PodMetrics> => {
  const metrics = [
    {
      key: 'memory',
      query: namespace
        ? `sum(container_memory_working_set_bytes{namespace='${namespace}',container=''}) BY (pod, namespace)`
        : "sum(container_memory_working_set_bytes{container=''}) BY (pod, namespace)",
    },
    {
      key: 'cpu',
      query: namespace
        ? `pod:container_cpu_usage:sum{namespace='${namespace}'}`
        : 'pod:container_cpu_usage:sum',
    },
  ];
  const promises = metrics.map(
    ({ key, query }): Promise<UIActions.PodMetrics> => {
      const url = namespace
        ? `${PROMETHEUS_TENANCY_BASE_PATH}/api/v1/query?namespace=${namespace}&query=${query}`
        : `${PROMETHEUS_BASE_PATH}/api/v1/query?query=${query}`;
      return coFetchJSON(url).then(({ data: { result } }) => {
        return result.reduce((acc, data) => {
          const value = Number(data.value[1]);
          return _.set(acc, [key, data.metric.namespace, data.metric.pod], value);
        }, {});
      });
    },
  );
  return Promise.all(promises).then((data: any[]) => _.assign({}, ...data));
};

export const menuActions = [
  ...Kebab.getExtensionsActionsForKind(PodModel),
  ...Kebab.factory.common,
];

// t('public~Name')
// t('public~Namespace')
// t('public~Status')
// t('public~Ready')
// t('public~Restarts')
// t('public~Owner')
// t('public~Node')
// t('public~Memory')
// t('public~CPU')
// t('public~Created')
// t('public~Labels')
// t('public~IP address')

const podColumnInfo = Object.freeze({
  name: {
    classes: '',
    id: 'name',
    title: 'public~Name',
  },
  namespace: {
    classes: '',
    id: 'namespace',
    title: 'public~Namespace',
  },
  status: {
    classes: '',
    id: 'status',
    title: 'public~Status',
  },
  ready: {
    classes: classNames('pf-m-nowrap', 'pf-u-w-10-on-lg', 'pf-u-w-8-on-xl'),
    id: 'ready',
    title: 'public~Ready',
  },
  restarts: {
    classes: classNames('pf-m-nowrap', 'pf-u-w-8-on-2xl'),
    id: 'restarts',
    title: 'public~Restarts',
  },
  owner: {
    classes: '',
    id: 'owner',
    title: 'public~Owner',
  },
  node: {
    classes: '',
    id: 'node',
    title: 'public~Node',
  },
  memory: {
    classes: classNames({ 'pf-u-w-10-on-2xl': showMetrics }),
    id: 'memory',
    title: 'public~Memory',
  },
  cpu: {
    classes: classNames({ 'pf-u-w-10-on-2xl': showMetrics }),
    id: 'cpu',
    title: 'public~CPU',
  },
  created: {
    classes: classNames('pf-u-w-10-on-2xl'),
    id: 'created',
    title: 'public~Created',
  },
  labels: {
    classes: '',
    id: 'labels',
    title: 'public~Labels',
  },
  ipaddress: {
    classes: '',
    id: 'ipaddress',
    title: 'public~IP address',
  },
});

const kind = 'Pod';
const columnManagementID = referenceForModel(PodModel);

const podRowStateToProps = ({ UI }) => ({
  metrics: UI.getIn(['metrics', 'pod']),
});

const getColumns = (showNodes: boolean, t: TFunction): TableColumn<PodKind>[] => [
  {
    title: t(podColumnInfo.name.title),
    id: podColumnInfo.name.id,
    sort: (data, direction) => {
      const sortFunc = (a: PodKind, b: PodKind) =>
        sortResourceByValue(a, b, direction, a.metadata.name, b.metadata.name);
      return data.sort(sortFunc);
    },
    transforms: [sortable],
    props: { className: podColumnInfo.name.classes },
  },
  {
    title: t(podColumnInfo.namespace.title),
    id: podColumnInfo.namespace.id,
    sort: (data, direction) => {
      const sortFunc = (a: PodKind, b: PodKind) =>
        sortResourceByValue(a, b, direction, a.metadata.namespace, b.metadata.namespace);
      return data.sort(sortFunc);
    },
    transforms: [sortable],
    props: { className: podColumnInfo.namespace.classes },
  },
  {
    title: t(podColumnInfo.status.title),
    id: podColumnInfo.status.id,
    sort: (data, direction) => {
      const sortFunc = (a: PodKind, b: PodKind) =>
        sortResourceByValue(a, b, direction, podPhase(a), podPhase(b));
      return data.sort(sortFunc);
    },
    transforms: [sortable],
    props: { className: podColumnInfo.status.classes },
  },
  {
    title: t(podColumnInfo.ready.title),
    id: podColumnInfo.ready.id,
    sort: (data, direction) => {
      const sortFunc = (a: PodKind, b: PodKind) =>
        sortResourceByValue(
          a,
          b,
          direction,
          podReadiness(a).readyCount,
          podReadiness(b).readyCount,
        );
      return data.sort(sortFunc);
    },
    transforms: [sortable],
    props: { className: podColumnInfo.ready.classes },
  },
  {
    title: t(podColumnInfo.restarts.title),
    id: podColumnInfo.restarts.id,
    sort: (data, direction) => {
      const sortFunc = (a: PodKind, b: PodKind) =>
        sortResourceByValue(a, b, direction, podRestarts(a), podRestarts(b));
      return data.sort(sortFunc);
    },
    transforms: [sortable],
    props: { className: podColumnInfo.restarts.classes },
  },
  {
    title: showNodes ? t(podColumnInfo.node.title) : t(podColumnInfo.owner.title),
    id: podColumnInfo.owner.id,
    sort: (data, direction) => {
      const sortFunc = (a: PodKind, b: PodKind) =>
        sortResourceByValue(
          a,
          b,
          direction,
          showNodes ? a.spec.nodeName : a.metadata.ownerReferences?.[0]?.name,
          showNodes ? b.spec.nodeName : b.metadata.ownerReferences?.[0]?.name,
        );
      return data.sort(sortFunc);
    },
    transforms: [sortable],
    props: { className: podColumnInfo.owner.classes },
  },
  {
    title: t(podColumnInfo.memory.title),
    id: podColumnInfo.memory.id,
    sort: (data, direction) => {
      const sortFunc = (a: PodKind, b: PodKind) =>
        sortResourceByValue(
          a,
          b,
          direction,
          UIActions.getPodMetric(a, 'memory'),
          UIActions.getPodMetric(b, 'memory'),
        );
      return data.sort(sortFunc);
    },
    transforms: [sortable],
    props: { className: podColumnInfo.memory.classes },
  },
  {
    title: t(podColumnInfo.cpu.title),
    id: podColumnInfo.cpu.id,
    sort: (data, direction) => {
      const sortFunc = (a: PodKind, b: PodKind) =>
        sortResourceByValue(
          a,
          b,
          direction,
          UIActions.getPodMetric(a, 'cpu'),
          UIActions.getPodMetric(b, 'cpu'),
        );
      return data.sort(sortFunc);
    },
    transforms: [sortable],
    props: { className: podColumnInfo.cpu.classes },
  },
  {
    title: t(podColumnInfo.created.title),
    id: podColumnInfo.created.id,
    sort: (data, direction) => {
      const sortFunc = (a: PodKind, b: PodKind) =>
        sortResourceByValue(
          a,
          b,
          direction,
          a.metadata.creationTimestamp,
          b.metadata.creationTimestamp,
        );
      return data.sort(sortFunc);
    },
    transforms: [sortable],
    props: { className: podColumnInfo.created.classes },
  },
  {
    title: t(podColumnInfo.node.title),
    id: podColumnInfo.node.id,
    sort: (data, direction) => {
      const sortFunc = (a: PodKind, b: PodKind) =>
        sortResourceByValue(a, b, direction, a.spec.nodeName, b.spec.nodeName);
      return data.sort(sortFunc);
    },
    transforms: [sortable],
    props: { className: podColumnInfo.node.classes },
    additional: true,
  },
  {
    title: t(podColumnInfo.labels.title),
    id: podColumnInfo.labels.id,
    sort: (data, direction) => {
      const sortFunc = (a: PodKind, b: PodKind) =>
        sortResourceByValue(a, b, direction, a.metadata.labels, b.metadata.labels);
      return data.sort(sortFunc);
    },
    transforms: [sortable],
    props: { className: podColumnInfo.labels.classes },
    additional: true,
  },
  {
    title: t(podColumnInfo.ipaddress.title),
    id: podColumnInfo.ipaddress.id,
    sort: (data, direction) => {
      const sortFunc = (a: PodKind, b: PodKind) =>
        sortResourceByValue(a, b, direction, a.status?.hostIP, b.status?.hostIP);
      return data.sort(sortFunc);
    },
    transforms: [sortable],
    props: { className: podColumnInfo.ipaddress.classes },
    additional: true,
  },
  {
    title: '',
    props: { className: Kebab.columnClass },
  },
];

const getSelectedColumns = (showNodes: boolean, t: TFunction) => {
  return new Set(
    getColumns(showNodes, t).reduce((acc, column) => {
      if (column.id && !column.additional) {
        acc.push(column.id);
      }
      return acc;
    }, []),
  );
};

const PodTableRow = connect<PodTableRowPropsFromState, null, PodTableRowProps>(podRowStateToProps)(
  ({
    obj: pod,
    index,
    style,
    metrics,
    showNodes,
    showNamespaceOverride,
  }: PodTableRowProps & PodTableRowPropsFromState) => {
    const { t } = useTranslation();
    const [tableColumns, , loaded] = useUserSettingsCompatibility(
      COLUMN_MANAGEMENT_CONFIGMAP_KEY,
      COLUMN_MANAGEMENT_LOCAL_STORAGE_KEY,
      undefined,
      true,
    );
    const { name, namespace, creationTimestamp, labels } = pod.metadata;
    const { readyCount, totalContainers } = podReadiness(pod);
    const phase = podPhase(pod);
    const restarts = podRestarts(pod);
    const bytes: number = _.get(metrics, ['memory', namespace, name]);
    const cores: number = _.get(metrics, ['cpu', namespace, name]);
    const columns: Set<string> =
      loaded && tableColumns?.[columnManagementID]?.length > 0
        ? new Set(tableColumns[columnManagementID])
        : getSelectedColumns(showNodes, t);
    return (
      <TableRow id={pod.metadata.uid} index={index} trKey={pod.metadata.uid} style={style}>
        <TableData className={podColumnInfo.name.classes}>
          <ResourceLink kind={kind} name={name} namespace={namespace} />
        </TableData>
        <TableData
          className={classNames(podColumnInfo.namespace.classes, 'co-break-word')}
          columns={columns}
          columnID={podColumnInfo.namespace.id}
          showNamespaceOverride={showNamespaceOverride}
        >
          <ResourceLink kind="Namespace" name={namespace} />
        </TableData>
        <TableData
          className={podColumnInfo.status.classes}
          columns={columns}
          columnID={podColumnInfo.status.id}
        >
          <PodStatus pod={pod} />
        </TableData>
        <TableData
          className={podColumnInfo.ready.classes}
          columns={columns}
          columnID={podColumnInfo.ready.id}
        >
          {readyCount}/{totalContainers}
        </TableData>
        <TableData
          className={podColumnInfo.restarts.classes}
          columns={columns}
          columnID={podColumnInfo.restarts.id}
        >
          {restarts}
        </TableData>
        <TableData
          className={podColumnInfo.owner.classes}
          columns={columns}
          columnID={podColumnInfo.owner.id}
        >
          {showNodes ? (
            <ResourceLink kind="Node" name={pod.spec.nodeName} namespace={namespace} />
          ) : (
            <OwnerReferences resource={pod} />
          )}
        </TableData>
        <TableData
          className={podColumnInfo.memory.classes}
          columns={columns}
          columnID={podColumnInfo.memory.id}
        >
          {bytes ? `${formatBytesAsMiB(bytes)} MiB` : '-'}
        </TableData>
        <TableData
          className={podColumnInfo.cpu.classes}
          columns={columns}
          columnID={podColumnInfo.cpu.id}
        >
          {cores ? `${formatCores(cores)} cores` : '-'}
        </TableData>
        <TableData
          className={podColumnInfo.created.classes}
          columns={columns}
          columnID={podColumnInfo.created.id}
        >
          <Timestamp timestamp={creationTimestamp} />
        </TableData>
        <TableData
          className={podColumnInfo.node.classes}
          columns={columns}
          columnID={podColumnInfo.node.id}
        >
          <ResourceLink kind="Node" name={pod.spec.nodeName} namespace={namespace} />
        </TableData>
        <TableData
          className={podColumnInfo.labels.classes}
          columns={columns}
          columnID={podColumnInfo.labels.id}
        >
          <LabelList kind={kind} labels={labels} />
        </TableData>
        <TableData
          className={podColumnInfo.ipaddress.classes}
          columns={columns}
          columnID={podColumnInfo.ipaddress.id}
        >
          {pod?.status?.hostIP ?? '-'}
        </TableData>
        <TableData className={Kebab.columnClass}>
          <ResourceKebab
            actions={menuActions}
            kind={kind}
            resource={pod}
            isDisabled={phase === 'Terminating'}
          />
        </TableData>
      </TableRow>
    );
  },
);
PodTableRow.displayName = 'PodTableRow';

export const ContainerLink: React.FC<ContainerLinkProps> = ({ pod, name }) => (
  <span className="co-resource-item co-resource-item--inline">
    <ResourceIcon kind="Container" />
    <Link to={`/k8s/ns/${pod.metadata.namespace}/pods/${pod.metadata.name}/containers/${name}`}>
      {name}
    </Link>
  </span>
);
ContainerLink.displayName = 'ContainerLink';

export const ContainerRow: React.FC<ContainerRowProps> = ({ pod, container }) => {
  const cstatus = getContainerStatus(pod, container.name);
  const cstate = getContainerState(cstatus);
  const startedAt = _.get(cstate, 'startedAt');
  const finishedAt = _.get(cstate, 'finishedAt');

  return (
    <div className="row">
      <div className="col-lg-2 col-md-3 col-sm-4 col-xs-5">
        <ContainerLink pod={pod} name={container.name} />
      </div>
      <div className="col-lg-2 col-md-3 col-sm-5 col-xs-7 co-truncate co-nowrap co-select-to-copy">
        {container.image || '-'}
      </div>
      <div className="col-lg-2 col-md-2 col-sm-3 hidden-xs">
        <Status status={cstate.label} />
      </div>
      <div className="col-lg-1 col-md-2 hidden-sm hidden-xs">
        {_.get(cstatus, 'restartCount', '0')}
      </div>
      <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">
        <Timestamp timestamp={startedAt} />
      </div>
      <div className="col-lg-2 hidden-md hidden-sm hidden-xs">
        <Timestamp timestamp={finishedAt} />
      </div>
      <div className="col-lg-1 hidden-md hidden-sm hidden-xs">{_.get(cstate, 'exitCode', '-')}</div>
    </div>
  );
};

export const PodContainerTable: React.FC<PodContainerTableProps> = ({
  heading,
  containers,
  pod,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <SectionHeading text={heading} />
      <div className="co-m-table-grid co-m-table-grid--bordered">
        <div className="row co-m-table-grid__head">
          <div className="col-lg-2 col-md-3 col-sm-4 col-xs-5">{t('public~Name')}</div>
          <div className="col-lg-2 col-md-3 col-sm-5 col-xs-7">{t('public~Image')}</div>
          <div className="col-lg-2 col-md-2 col-sm-3 hidden-xs">{t('public~State')}</div>
          <div className="col-lg-1 col-md-2 hidden-sm hidden-xs">{t('public~Restarts')}</div>
          <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">{t('public~Started')}</div>
          <div className="col-lg-2 hidden-md hidden-sm hidden-xs">{t('public~Finished')}</div>
          <div className="col-lg-1 hidden-md hidden-sm hidden-xs">{t('public~Exit code')}</div>
        </div>
        <div className="co-m-table-grid__body">
          {containers.map((c: any, i: number) => (
            <ContainerRow key={i} pod={pod} container={c} />
          ))}
        </div>
      </div>
    </>
  );
};

const getNetworkName = (result: PrometheusResult) =>
  // eslint-disable-next-line camelcase
  result?.metric?.network_name || 'unnamed interface';

const PodGraphs = requirePrometheus(({ pod }) => {
  const { t } = useTranslation();
  const chartTitles = {
    memory: t('public~Memory usage'),
    cpu: t('public~CPU usage'),
    fs: t('public~Filesystem'),
    networkIn: t('public~Network in'),
    networkOut: t('public~Network out'),
  };
  return (
    <>
      <div className="row">
        <div className="col-md-12 col-lg-4">
          <Area
            title={chartTitles.memory}
            ariaChartLinkLabel={t('public~View {{title}} metrics in query browser', {
              title: chartTitles.memory,
            })}
            humanize={humanizeBinaryBytes}
            byteDataType={ByteDataTypes.BinaryBytes}
            namespace={pod.metadata.namespace}
            query={`sum(container_memory_working_set_bytes{pod='${pod.metadata.name}',namespace='${pod.metadata.namespace}',container='',}) BY (pod, namespace)`}
            limitQuery={`sum(kube_pod_resource_limit{resource='memory',pod='${pod.metadata.name}',namespace='${pod.metadata.namespace}'})`}
            requestedQuery={`sum(kube_pod_resource_request{resource='memory',pod='${pod.metadata.name}',namespace='${pod.metadata.namespace}'}) BY (pod, namespace)`}
          />
        </div>
        <div className="col-md-12 col-lg-4">
          <Area
            title={chartTitles.cpu}
            ariaChartLinkLabel={t('public~View {{title}} metrics in query browser', {
              title: chartTitles.cpu,
            })}
            humanize={humanizeCpuCores}
            namespace={pod.metadata.namespace}
            query={`pod:container_cpu_usage:sum{pod='${pod.metadata.name}',namespace='${pod.metadata.namespace}'}`}
            limitQuery={`sum(kube_pod_resource_limit{resource='cpu',pod='${pod.metadata.name}',namespace='${pod.metadata.namespace}'})`}
            requestedQuery={`sum(kube_pod_resource_request{resource='cpu',pod='${pod.metadata.name}',namespace='${pod.metadata.namespace}'}) BY (pod, namespace)`}
          />
        </div>
        <div className="col-md-12 col-lg-4">
          <Area
            title={chartTitles.fs}
            ariaChartLinkLabel={t('public~View {{title}} metrics in query browser', {
              title: chartTitles.fs,
            })}
            humanize={humanizeBinaryBytes}
            byteDataType={ByteDataTypes.BinaryBytes}
            namespace={pod.metadata.namespace}
            query={`pod:container_fs_usage_bytes:sum{pod='${pod.metadata.name}',namespace='${pod.metadata.namespace}'}`}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-md-12 col-lg-4">
          <Stack
            title={chartTitles.networkIn}
            ariaChartLinkLabel={t('public~View {{title}} metrics in query browser', {
              title: chartTitles.networkIn,
            })}
            humanize={humanizeDecimalBytesPerSec}
            namespace={pod.metadata.namespace}
            query={`(sum(irate(container_network_receive_bytes_total{pod='${pod.metadata.name}', namespace='${pod.metadata.namespace}'}[5m])) by (pod, namespace, interface)) + on(namespace,pod,interface) group_left(network_name) ( pod_network_name_info )`}
            description={getNetworkName}
          />
        </div>
        <div className="col-md-12 col-lg-4">
          <Stack
            title={chartTitles.networkOut}
            ariaChartLinkLabel={t('public~View {{title}} metrics in query browser', {
              title: chartTitles.networkOut,
            })}
            humanize={humanizeDecimalBytesPerSec}
            namespace={pod.metadata.namespace}
            query={`(sum(irate(container_network_transmit_bytes_total{pod='${pod.metadata.name}', namespace='${pod.metadata.namespace}'}[5m])) by (pod, namespace, interface)) + on(namespace,pod,interface) group_left(network_name) ( pod_network_name_info )`}
            description={getNetworkName}
          />
        </div>
      </div>
      <br />
    </>
  );
});

const PodStatusPopover: React.FC<PodStatusPopoverProps> = ({
  bodyContent,
  headerContent,
  status,
}) => {
  return (
    <Popover headerContent={headerContent} bodyContent={bodyContent}>
      <Button variant="link" isInline>
        <Status status={status} />
      </Button>
    </Popover>
  );
};

export const PodStatus: React.FC<PodStatusProps> = ({ pod }) => {
  const status = podPhase(pod);
  const unschedulableCondition = pod.status?.conditions?.find(
    (condition) => condition.reason === 'Unschedulable' && condition.status === 'False',
  );
  const containerStatusStateWaiting = pod.status?.containerStatuses?.find(
    (cs) => cs.state?.waiting,
  );
  const { t } = useTranslation();

  if (status === 'Pending' && unschedulableCondition) {
    return (
      <PodStatusPopover
        bodyContent={unschedulableCondition.message}
        headerContent={t('public~Pod unschedulable')}
        status={status}
      />
    );
  }
  if (
    (status === 'CrashLoopBackOff' || status === 'ErrImagePull' || status === 'ImagePullBackOff') &&
    containerStatusStateWaiting
  ) {
    return (
      <PodStatusPopover
        bodyContent={containerStatusStateWaiting.state.waiting.message}
        status={status}
      />
    );
  }

  return <Status status={status} />;
};

export const PodDetailsList: React.FC<PodDetailsListProps> = ({ pod }) => {
  const { t } = useTranslation();
  return (
    <dl className="co-m-pane__details">
      <dt>{t('public~Status')}</dt>
      <dd>
        <PodStatus pod={pod} />
      </dd>
      <DetailsItem label={t('public~Restart policy')} obj={pod} path="spec.restartPolicy">
        {getRestartPolicyLabel(pod)}
      </DetailsItem>
      <DetailsItem
        label={t('public~Active deadline seconds')}
        obj={pod}
        path="spec.activeDeadlineSeconds"
      >
        {pod.spec.activeDeadlineSeconds
          ? t('public~{{count}} second', { count: pod.spec.activeDeadlineSeconds })
          : t('public~Not configured')}
      </DetailsItem>
      <DetailsItem label={t('public~Pod IP')} obj={pod} path="status.podIP" />
      <DetailsItem label={t('public~Node')} obj={pod} path="spec.nodeName" hideEmpty>
        <NodeLink name={pod.spec.nodeName} />
      </DetailsItem>
      <RuntimeClass obj={pod} path="spec.runtimeClassName" />
    </dl>
  );
};

export const PodResourceSummary: React.FC<PodResourceSummaryProps> = ({ pod }) => (
  <ResourceSummary
    resource={pod}
    showNodeSelector
    nodeSelector="spec.nodeSelector"
    showTolerations
  />
);

const Details: React.FC<PodDetailsProps> = ({ obj: pod }) => {
  const limits = {
    cpu: null,
    memory: null,
  };
  limits.cpu = _.reduce(
    pod.spec.containers,
    (sum, container) => {
      const value = units.dehumanize(_.get(container, 'resources.limits.cpu', 0), 'numeric').value;
      return sum + value;
    },
    0,
  );
  limits.memory = _.reduce(
    pod.spec.containers,
    (sum, container) => {
      const value = units.dehumanize(
        _.get(container, 'resources.limits.memory', 0),
        'binaryBytesWithoutB',
      ).value;
      return sum + value;
    },
    0,
  );
  const { t } = useTranslation();
  return (
    <>
      <ScrollToTopOnMount />
      <div className="co-m-pane__body">
        <SectionHeading text={t('public~Pod details')} />
        <PodGraphs pod={pod} />
        <div className="row">
          <div className="col-sm-6">
            <PodResourceSummary pod={pod} />
          </div>
          <div className="col-sm-6">
            <PodDetailsList pod={pod} />
          </div>
        </div>
      </div>
      {pod.spec.initContainers && (
        <div className="co-m-pane__body">
          <PodContainerTable
            key="initContainerTable"
            heading={t('public~Init containers')}
            containers={pod.spec.initContainers}
            pod={pod}
          />
        </div>
      )}
      <div className="co-m-pane__body">
        <PodContainerTable
          key="containerTable"
          heading={t('public~Containers')}
          containers={pod.spec.containers}
          pod={pod}
        />
      </div>
      <div className="co-m-pane__body">
        <VolumesTable resource={pod} heading={t('public~Volumes')} />
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={t('public~Conditions')} />
        <Conditions conditions={pod.status.conditions} />
      </div>
    </>
  );
};

const EnvironmentPage = (props: any) => (
  <AsyncComponent
    loader={() => import('./environment.jsx').then((c) => c.EnvironmentPage)}
    {...props}
  />
);

const envPath = ['spec', 'containers'];
const PodEnvironmentComponent = (props) => (
  <EnvironmentPage obj={props.obj} rawEnvData={props.obj.spec} envPath={envPath} readOnly={true} />
);

export const PodExecLoader: React.FC<PodExecLoaderProps> = ({ obj, message }) => (
  <div className="co-m-pane__body">
    <div className="row">
      <div className="col-xs-12">
        <div className="panel-body">
          <AsyncComponent
            loader={() => import('./pod-exec').then((c) => c.PodExec)}
            obj={obj}
            message={message}
          />
        </div>
      </div>
    </div>
  </div>
);

export const PodsDetailsPage: React.FC<PodDetailsPageProps> = (props) => {
  // t('public~Terminal')
  return (
    <DetailsPage
      {...props}
      getResourceStatus={podPhase}
      menuActions={menuActions}
      pages={[
        navFactory.details(Details),
        navFactory.editYaml(),
        navFactory.envEditor(PodEnvironmentComponent),
        navFactory.logs(PodLogs),
        navFactory.events(ResourceEventStream),
        {
          href: 'terminal',
          nameKey: 'public~Terminal',
          component: PodExecLoader,
        },
      ]}
    />
  );
};
PodsDetailsPage.displayName = 'PodsDetailsPage';

export const PodList: React.FC<PodListProps> = withUserSettingsCompatibility<
  PodListProps & WithUserSettingsCompatibilityProps<TableColumnsType>,
  TableColumnsType
>(
  COLUMN_MANAGEMENT_CONFIGMAP_KEY,
  COLUMN_MANAGEMENT_LOCAL_STORAGE_KEY,
  undefined,
  true,
)(
  ({
    userSettingState: tableColumns,
    data,
    loaded,
    showNodes,
    showNamespaceOverride,
    loadError,
  }) => {
    const { t } = useTranslation();
    const selectedColumns = React.useMemo<Set<string>>(
      () =>
        tableColumns?.[columnManagementID]?.length > 0
          ? new Set(tableColumns[columnManagementID])
          : null,
      [tableColumns],
    );

    const Row = React.useCallback<React.FC<RowProps<PodKind>>>(
      (rowProps) => (
        <PodTableRow
          {...rowProps}
          showNodes={showNodes}
          showNamespaceOverride={showNamespaceOverride}
        />
      ),
      [showNamespaceOverride, showNodes],
    );

    const columns = React.useMemo(() => getColumns(showNodes, t), [showNodes, t]);
    return (
      <VirtualizedTable
        data={data}
        loaded={loaded}
        loadError={loadError}
        activeColumns={selectedColumns}
        columnManagementID={columnManagementID}
        showNamespaceOverride={showNamespaceOverride}
        aria-label={t('public~Pods')}
        columns={columns}
        Row={Row}
      />
    );
  },
);
PodList.displayName = 'PodList';

export const filters = [
  {
    filterGroupName: 'Status',
    type: 'pod-status',
    reducer: podPhaseFilterReducer,
    items: [
      { id: 'Running', title: 'Running' },
      { id: 'Pending', title: 'Pending' },
      { id: 'Terminating', title: 'Terminating' },
      { id: 'CrashLoopBackOff', title: 'CrashLoopBackOff' },
      // Use title "Completed" to match what appears in the status column for the pod.
      // The pod phase is "Succeeded," but the container state is "Completed."
      { id: 'Succeeded', title: 'Completed' },
      { id: 'Failed', title: 'Failed' },
      { id: 'Unknown', title: 'Unknown ' },
    ],
  },
];

const dispatchToProps = (dispatch): PodPagePropsFromDispatch => ({
  setPodMetrics: (metrics) => dispatch(UIActions.setPodMetrics(metrics)),
});

export const PodsPage = connect<{}, PodPagePropsFromDispatch, PodPageProps>(
  null,
  dispatchToProps,
)(
  withUserSettingsCompatibility<
    PodPagePropsFromDispatch & PodPageProps & WithUserSettingsCompatibilityProps<TableColumnsType>,
    TableColumnsType
  >(
    COLUMN_MANAGEMENT_CONFIGMAP_KEY,
    COLUMN_MANAGEMENT_LOCAL_STORAGE_KEY,
    undefined,
    true,
  )(
    (
      props: PodPageProps &
        PodPagePropsFromDispatch &
        WithUserSettingsCompatibilityProps<TableColumnsType>,
    ) => {
      const {
        canCreate = true,
        namespace,
        setPodMetrics,
        userSettingState: tableColumns,
        showTitle = true,
        selector,
        fieldSelector,
        showNodes,
        showNamespaceOverride,
      } = props;
      const { t } = useTranslation();
      /* eslint-disable react-hooks/exhaustive-deps */
      React.useEffect(() => {
        if (showMetrics) {
          const updateMetrics = () =>
            fetchPodMetrics(namespace)
              .then(setPodMetrics)
              .catch((e) => {
                // Just log the error here. Showing a warning alert could be more annoying
                // than helpful. It should be obvious there are no metrics in the list, and
                // if monitoring is broken, it'll be really apparent since none of the
                // graphs and dashboards will load in the UI.
                // eslint-disable-next-line no-console
                console.error('Unable to fetch pod metrics', e);
              });
          updateMetrics();
          const id = setInterval(updateMetrics, 30 * 1000);
          return () => clearInterval(id);
        }
      }, [namespace]);
      /* eslint-enable react-hooks/exhaustive-deps */

      const [pods, loaded, loadError] = useK8sWatchResource<PodKind[]>({
        kind,
        isList: true,
        namespaced: true,
        namespace,
        selector,
        fieldSelector,
      });

      const [data, filteredData, onFilterChange] = useListPageFilter(pods);

      return (
        <>
          <ListPageHeader title={showTitle ? t('public~Pods') : undefined}>
            {canCreate && (
              <ListPageCreate groupVersionKind={referenceForModel(PodModel)}>
                {t('public~Create Pod')}
              </ListPageCreate>
            )}
          </ListPageHeader>
          <ListPageBody>
            <ListPageFilter
              data={data}
              loaded={loaded}
              rowFilters={filters}
              onFilterChange={onFilterChange}
              columnLayout={{
                columns: getColumns(showNodes, t),
                id: columnManagementID,
                selectedColumns:
                  tableColumns?.[columnManagementID]?.length > 0
                    ? new Set(tableColumns[columnManagementID])
                    : null,
                showNamespaceOverride,
                type: t('public~Pod'),
              }}
            />
            <PodList
              data={filteredData}
              loaded={loaded}
              loadError={loadError}
              showNamespaceOverride={showNamespaceOverride}
              showNodes={showNodes}
            />
          </ListPageBody>
        </>
      );
    },
  ),
);

type ContainerLinkProps = {
  pod: PodKind;
  name: string;
};

type ContainerRowProps = {
  pod: PodKind;
  container: ContainerSpec;
};

type PodContainerTableProps = {
  heading: string;
  containers: ContainerSpec[];
  pod: PodKind;
};

type PodStatusPopoverProps = {
  bodyContent: string;
  headerContent?: string;
  status: string;
};

type PodStatusProps = {
  pod: PodKind;
};

type PodResourceSummaryProps = {
  pod: PodKind;
};

type PodDetailsListProps = {
  pod: PodKind;
};

type PodExecLoaderProps = {
  obj: PodKind;
  message?: React.ReactElement;
};

type PodDetailsProps = {
  obj: PodKind;
};

type PodTableRowProps = RowProps<PodKind> & {
  showNodes?: boolean;
  showNamespaceOverride?: boolean;
};

type PodTableRowPropsFromState = {
  metrics: UIActions.PodMetrics;
};

type PodListProps = {
  data: PodKind[];
  loaded: boolean;
  loadError: any;
  showNamespaceOverride?: boolean;
  showNodes?: boolean;
};

type PodPageProps = {
  canCreate?: boolean;
  fieldSelector?: any;
  namespace?: string;
  selector?: any;
  showTitle?: boolean;
  showNamespaceOverride?: boolean;
  showNodes?: boolean;
};

type PodPagePropsFromDispatch = {
  setPodMetrics: (metrics) => void;
};

type PodDetailsPageProps = {
  kind: K8sResourceKindReference;
  match: any;
};
