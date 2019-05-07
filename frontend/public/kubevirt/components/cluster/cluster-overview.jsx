import React from 'react';
import * as _ from 'lodash-es';
import { connect } from 'react-redux';
import {
  ClusterOverview as KubevirtClusterOverview,
  getResource,
  ClusterOverviewContext,
  complianceData,
  getCapacityStats,
  STORAGE_PROMETHEUS_QUERIES,
} from 'kubevirt-web-ui-components';

import { dashboardReducerName } from '../dashboards/dashboard-reducers';
import {
  NodeModel,
  PodModel,
  PersistentVolumeClaimModel,
  VirtualMachineModel,
  InfrastructureModel,
  VirtualMachineInstanceMigrationModel,
  BaremetalHostModel,
} from '../../../models';
import { WithResources } from '../utils/withResources';
import { coFetch } from '../../../co-fetch';

import { EventStream } from '../../../components/events';
import { EventsInnerOverview } from './events-inner-overview';
import { LoadingInline} from '../utils/okdutils';
import { LazyRenderer } from '../utils/lazyRenderer';
import { getPrometheusQuery, getPrometheusMetrics } from '../dashboards/dashboards';

const CONSUMERS_CPU_QUERY = 'sort(topk(5, pod_name:container_cpu_usage:sum))';
const CONSUMERS_MEMORY_QUERY = 'sort(topk(5, pod_name:container_memory_usage_bytes:sum))';

const CONSUMERS_STORAGE_QUERY = 'sort(topk(5, avg by (pod_name)(irate(container_fs_io_time_seconds_total{container_name="POD", pod_name!=""}[1m]))))';
const CONSUMERS_NETWORK_QUERY = `sort(topk(5, sum by (pod_name)(irate(container_network_receive_bytes_total{container_name="POD", pod_name!=""}[1m]) + 
  irate(container_network_transmit_bytes_total{container_name="POD", pod_name!=""}[1m]))))`;

const NODE_CONSUMERS_CPU_QUERY = 'sort(topk(5, node:node_cpu_utilisation:avg1m))';
const NODE_CONSUMERS_MEMORY_QUERY = 'sort(topk(5, node:node_memory_bytes_total:sum - node:node_memory_bytes_available:sum))';

const NODE_CONSUMERS_STORAGE_QUERY = 'sort(topk(5, node:node_disk_utilisation:avg_irate{cluster=""}))';
const NODE_CONSUMERS_NETWORK_QUERY = 'sort(topk(5, node:node_net_utilisation:sum_irate{cluster=""}))';

const OPENSHIFT_VERSION_QUERY = 'openshift_build_info{job="apiserver"}';

const CAPACITY_MEMORY_TOTAL_QUERY = 'sum(kube_node_status_capacity_memory_bytes)';

const CAPACITY_NETWORK_TOTAL_QUERY = 'sum(avg by(instance)(node_network_speed_bytes))'; // TODO(mlibra): needs to be refined
const CAPACITY_NETWORK_USED_QUERY = 'sum(node:node_net_utilisation:sum_irate)';

const UTILIZATION_CPU_USED_QUERY = '((sum(node:node_cpu_utilisation:avg1m) / count(node:node_cpu_utilisation:avg1m)) * 100)[60m:5m]';
const UTILIZATION_MEMORY_USED_QUERY = '(sum(kube_node_status_capacity_memory_bytes) - sum(kube_node_status_allocatable_memory_bytes))[60m:5m]'; // TOTAL is reused from CAPACITY_MEMORY_TOTAL_QUERY

const {
  CEPH_STATUS_QUERY,
  CEPH_OSD_UP_QUERY,
  CEPH_OSD_DOWN_QUERY,
  CEPH_CAPACITY_TOTAL_QUERY,
  CEPH_CAPACITY_UTILIZATION_QUERY,
  CAPACITY_STORAGE_TOTAL_DEFAULT_QUERY,
  UTILIZATION_STORAGE_USED_DEFAULT_QUERY,
  UTILIZATION_STORAGE_IORW_QUERY,
} = STORAGE_PROMETHEUS_QUERIES;

const resourceMap = {
  nodes: {
    resource: getResource(NodeModel, {namespaced: false}),
  },
  pods: {
    resource: getResource(PodModel),
  },
  pvcs: {
    resource: getResource(PersistentVolumeClaimModel),
  },
  vms: {
    resource: getResource(VirtualMachineModel),
  },
  infrastructure: {
    resource: getResource(InfrastructureModel, { namespaced: false, name: 'cluster', isList: false }),
  },
  migrations: {
    resource: getResource(VirtualMachineInstanceMigrationModel),
  },
  hosts: {
    resource: getResource(BaremetalHostModel),
  },
};

const K8S_HEALTH_URL = '/healthz';
const CNV_HEALTH_URL = `/apis/subresources.${VirtualMachineModel.apiGroup}/${VirtualMachineModel.apiVersion}/healthz`;

const OverviewEventStream = () => <EventStream scrollableElementId="events-body" InnerComponent={EventsInnerOverview} overview={true} namespace={undefined} />;

const prometheusQueries = [
  CONSUMERS_CPU_QUERY,
  CONSUMERS_MEMORY_QUERY,
  CONSUMERS_STORAGE_QUERY,
  CONSUMERS_NETWORK_QUERY,
  NODE_CONSUMERS_MEMORY_QUERY,
  NODE_CONSUMERS_CPU_QUERY,
  NODE_CONSUMERS_STORAGE_QUERY,
  NODE_CONSUMERS_NETWORK_QUERY,
  OPENSHIFT_VERSION_QUERY,
  CAPACITY_MEMORY_TOTAL_QUERY,
  CAPACITY_NETWORK_TOTAL_QUERY,
  CAPACITY_NETWORK_USED_QUERY,
  CEPH_OSD_UP_QUERY,
  CEPH_OSD_DOWN_QUERY,
  UTILIZATION_CPU_USED_QUERY,
  UTILIZATION_MEMORY_USED_QUERY,
  CEPH_STATUS_QUERY,
  UTILIZATION_STORAGE_IORW_QUERY, // Ceph only; will cause error and so the NOT_AVAILABLE state of the component without Ceph
];

export class ClusterOverview extends React.Component {
  constructor(props){
    super(props);
    this.state = {};

    this.getStorageMetrics = this._getStorageMetrics.bind(this);
  }

  async _getStorageMetrics() {
    let queryTotal = CAPACITY_STORAGE_TOTAL_DEFAULT_QUERY;
    let queryUsed = UTILIZATION_STORAGE_USED_DEFAULT_QUERY;
    try {
      const metrics = await getPrometheusMetrics();
      if (_.get(metrics, 'data', []).find(metric => metric === CEPH_CAPACITY_TOTAL_QUERY)) {
        const cephData = await getPrometheusQuery(CEPH_CAPACITY_TOTAL_QUERY);
        if (getCapacityStats(cephData)) { // Ceph data are available
          this.setState({ cephAvailable: true });
          queryTotal = CEPH_CAPACITY_TOTAL_QUERY;
          queryUsed = CEPH_CAPACITY_UTILIZATION_QUERY;
        }
      }
    } finally {
      this.props.fetchPrometheusQueries([queryTotal, queryUsed]);
    }
  }

  fetchHealth() {
    const handleK8sHealthResponse = async response => {
      const text = await response.text();
      return {response: text};
    };
    this.props.fetchUrl(K8S_HEALTH_URL, handleK8sHealthResponse, coFetch);
    this.props.fetchUrl(CNV_HEALTH_URL);
  }

  componentDidMount() {
    this.props.fetchPrometheusQueries(prometheusQueries);

    this.fetchHealth();
    this.getStorageMetrics();
    this.props.fetchAlerts();
  }

  componentWillUnmount() {
    this.props.clearTimeouts();
  }

  render() {
    const inventoryResourceMapToProps = resources => {
      const { prometheusResults, alertsResults, urlResults } = this.props;

      let storageTotal = prometheusResults[CAPACITY_STORAGE_TOTAL_DEFAULT_QUERY];
      let storageUsed = prometheusResults[UTILIZATION_STORAGE_USED_DEFAULT_QUERY];
      if (this.state.cephAvailable) {
        storageTotal = prometheusResults[CEPH_CAPACITY_TOTAL_QUERY];
        storageUsed = prometheusResults[CEPH_CAPACITY_UTILIZATION_QUERY];
      }

      return {
        value: {
          LoadingComponent: LoadingInline,
          ...resources,
          workloadCpuResults: prometheusResults[CONSUMERS_CPU_QUERY],
          workloadMemoryResults: prometheusResults[CONSUMERS_MEMORY_QUERY],
          workloadStorageResults: prometheusResults[CONSUMERS_STORAGE_QUERY],
          workloadNetworkResults: prometheusResults[CONSUMERS_NETWORK_QUERY],
          infraMemoryResults: prometheusResults[NODE_CONSUMERS_MEMORY_QUERY],
          infraCpuResults: prometheusResults[NODE_CONSUMERS_CPU_QUERY],
          infraStorageResults: prometheusResults[NODE_CONSUMERS_STORAGE_QUERY],
          infraNetworkResults: prometheusResults[NODE_CONSUMERS_NETWORK_QUERY],

          openshiftClusterVersionResponse: prometheusResults[OPENSHIFT_VERSION_QUERY],
          memoryTotal: prometheusResults[CAPACITY_MEMORY_TOTAL_QUERY],
          networkTotal: prometheusResults[CAPACITY_NETWORK_TOTAL_QUERY],
          networkUsed: prometheusResults[CAPACITY_NETWORK_USED_QUERY],
          cephOsdUp: prometheusResults[CEPH_OSD_UP_QUERY],
          cephOsdDown: prometheusResults[CEPH_OSD_DOWN_QUERY],
          cpuUtilization: prometheusResults[UTILIZATION_CPU_USED_QUERY],
          memoryUtilization: prometheusResults[UTILIZATION_MEMORY_USED_QUERY],
          ocsHealthResponse: prometheusResults[CEPH_STATUS_QUERY],
          storageTotal,
          storageUsed,
          storageIORW: prometheusResults[UTILIZATION_STORAGE_IORW_QUERY],

          k8sHealth: urlResults[K8S_HEALTH_URL],
          kubevirtHealth: urlResults[CNV_HEALTH_URL],
          alertsResponse: alertsResults,

          eventsData: {
            Component: OverviewEventStream,
            loaded: true,
          },
          complianceData, // TODO: mock, replace by real data and remove from web-ui-components
        },
      };
    };

    return (
      <WithResources resourceMap={resourceMap} resourceToProps={inventoryResourceMapToProps}>
        <LazyRenderer>
          <ClusterOverviewContext.Provider>
            <KubevirtClusterOverview />
          </ClusterOverviewContext.Provider>
        </LazyRenderer>
      </WithResources>
    );
  }
}

const mapStateToProps = state => ({
  prometheusResults: state[dashboardReducerName].PROMETHEUS_RESULTS,
  urlResults: state[dashboardReducerName].URL_RESULTS,
  alertsResults: state[dashboardReducerName].ALERTS_RESULTS,
});

export const ClusterOverviewConnected = connect(mapStateToProps)(ClusterOverview);
