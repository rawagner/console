import React from 'react';
import { connect } from 'react-redux';

import {
  StorageOverview as KubevirtStorageOverview,
  StorageOverviewContext,
  getResource,
  STORAGE_PROMETHEUS_QUERIES,
} from 'kubevirt-web-ui-components';

import { dashboardReducerName } from '../../../kubevirt/components/dashboards/dashboard-reducers';
import {
  CephClusterModel,
  NodeModel,
  PersistentVolumeClaimModel,
  PersistentVolumeModel,
  PodModel,
} from '../../../models';

import { WithResources } from '../../../kubevirt/components/utils/withResources';
import { LoadingInline } from '../../../kubevirt/components/utils/okdutils';
import { EventStream } from '../../../components/events';
import { EventsInnerOverview } from '../../../kubevirt/components/cluster/events-inner-overview';
import { LazyRenderer } from '../../../kubevirt/components/utils/lazyRenderer';

const CEPH_PG_CLEAN_AND_ACTIVE_QUERY = 'ceph_pg_clean and ceph_pg_active';
const CEPH_PG_TOTAL_QUERY = 'ceph_pg_total';

const UTILIZATION_IOPS_QUERY = '(sum(rate(ceph_pool_wr[1m])) + sum(rate(ceph_pool_rd[1m])))[10m:30s]';
//This query only count the latency for all drives in the configuration. Might go with same for the demo
const UTILIZATION_LATENCY_QUERY = '(quantile(.95,(cluster:ceph_disk_latency:join_ceph_node_disk_irate1m)))[10m:30s]';
const UTILIZATION_THROUGHPUT_QUERY = '(sum(rate(ceph_pool_wr_bytes[1m]) + rate(ceph_pool_rd_bytes[1m])))[10m:30s]';
const UTILIZATION_RECOVERY_RATE_QUERY = 'sum(ceph_pool_recovering_bytes_per_sec)[10m:30s]';
const TOP_CONSUMERS_QUERY = '(sum((max(kube_persistentvolumeclaim_status_phase{phase="Bound"}) by (namespace,pod,persistentvolumeclaim) ) * max(avg_over_time(kube_persistentvolumeclaim_resource_requests_storage_bytes[1h])) by (namespace,pod,persistentvolumeclaim)) by (namespace))[10m:1m]';

const {
  CEPH_STATUS_QUERY,
  CEPH_OSD_UP_QUERY,
  CEPH_OSD_DOWN_QUERY,
  CEPH_CAPACITY_TOTAL_QUERY,
  CEPH_CAPACITY_UTILIZATION_QUERY,
} = STORAGE_PROMETHEUS_QUERIES;

const resourceMap = {
  nodes: {
    resource: getResource(NodeModel, { namespaced: false }),
  },
  pvs: {
    resource: getResource(PersistentVolumeModel),
  },
  pvcs: {
    resource: getResource(PersistentVolumeClaimModel),
  },
  cephCluster: {
    resource: getResource(CephClusterModel),
  },
};

const pvcFilter = ({ kind }) => PersistentVolumeClaimModel.kind === kind;
const podFilter = ({ kind, namespace }) => PodModel.kind === kind && namespace === 'openshift-storage';

const EventStreamComponent = () => <EventStream scrollableElementId="events-body" InnerComponent={EventsInnerOverview} overview={true} namespace={undefined} filter={[pvcFilter, podFilter]} />;

const prometheusQueries = [
  CEPH_STATUS_QUERY,
  CEPH_OSD_DOWN_QUERY,
  CEPH_OSD_UP_QUERY,
  UTILIZATION_IOPS_QUERY,
  UTILIZATION_LATENCY_QUERY,
  UTILIZATION_THROUGHPUT_QUERY,
  UTILIZATION_RECOVERY_RATE_QUERY,
  CEPH_CAPACITY_TOTAL_QUERY,
  CEPH_CAPACITY_UTILIZATION_QUERY,
  CEPH_PG_CLEAN_AND_ACTIVE_QUERY,
  CEPH_PG_TOTAL_QUERY,
  TOP_CONSUMERS_QUERY,
];

export class StorageOverview extends React.Component {
  componentDidMount() {
    this.props.fetchPrometheusQueries(prometheusQueries);
    this.props.fetchAlerts();
  }

  componentWillUnmount() {
    this.props.clearTimeouts();
  }

  render() {
    const inventoryResourceMapToProps = resources => {
      const { prometheusResults, alertsResults } = this.props;
      return {
        value: {
          LoadingComponent: LoadingInline,
          ...resources,
          ocsHealthResponse: prometheusResults[CEPH_STATUS_QUERY],
          cephOsdDown: prometheusResults[CEPH_OSD_DOWN_QUERY],
          cephOsdUp: prometheusResults[CEPH_OSD_UP_QUERY],
          iopsUtilization: prometheusResults[UTILIZATION_IOPS_QUERY],
          latencyUtilization: prometheusResults[UTILIZATION_LATENCY_QUERY],
          throughputUtilization: prometheusResults[UTILIZATION_THROUGHPUT_QUERY],
          recoveryRateUtilization: prometheusResults[UTILIZATION_RECOVERY_RATE_QUERY],
          storageTotal: prometheusResults[CEPH_CAPACITY_TOTAL_QUERY],
          storageUsed: prometheusResults[CEPH_CAPACITY_UTILIZATION_QUERY],
          cleanAndActivePgRaw: prometheusResults[CEPH_PG_CLEAN_AND_ACTIVE_QUERY],
          totalPgRaw: prometheusResults[CEPH_PG_TOTAL_QUERY],
          topConsumers: prometheusResults[TOP_CONSUMERS_QUERY],
          alertsResponse: alertsResults,
          EventStreamComponent,
        },
      };
    };

    return (
      <WithResources
        resourceMap={resourceMap}
        resourceToProps={inventoryResourceMapToProps}
      >
        <LazyRenderer>
          <StorageOverviewContext.Provider>
            <KubevirtStorageOverview />
          </StorageOverviewContext.Provider>
        </LazyRenderer>
      </WithResources>
    );
  }
}

const mapStateToProps = state => ({
  prometheusResults: state[dashboardReducerName].PROMETHEUS_RESULTS,
  alertsResults: state[dashboardReducerName].ALERTS_RESULTS,
});

export const StorageOverviewConnected = connect(mapStateToProps)(StorageOverview);
