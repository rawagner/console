import * as React from 'react';
import {
  withDashboardResources,
  DashboardItemProps,
} from '../dashboards-page/with-dashboard-resources';
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardBody,
} from '../dashboard/dashboard-card';
import { UtilizationBody, UtilizationItem } from '../dashboard/utilization-card';
import { humanizeCpuCores, humanizeDecimalBytes, humanizeNumber } from '../utils';
import { getRangeVectorStats } from '../graphs/utils';
import { PrometheusResponse } from '../graphs';

export const UtilizationCard = withDashboardResources(
  ({
    watchPrometheus,
    stopWatchPrometheusQuery,
    prometheusResults,
    projectName,
  }: UtilizationCardProps) => {
    const cpuQuery = `namespace:container_cpu_usage:sum{namespace='${projectName}'}[60m:5m]`;
    const memoryQuery = `sum by(namespace) (container_memory_working_set_bytes{namespace="${projectName}",container="",pod!=""})[60m:5m]`;
    const podCountQuery = `count(kube_pod_info{namespace="${projectName}"}) by (namespace)[60m:5m]`;
    React.useEffect(() => {
      watchPrometheus(cpuQuery, projectName);
      watchPrometheus(memoryQuery, projectName);
      watchPrometheus(podCountQuery, projectName);
      return () => {
        stopWatchPrometheusQuery(cpuQuery);
        stopWatchPrometheusQuery(memoryQuery);
        stopWatchPrometheusQuery(podCountQuery);
      };
    }, [
      watchPrometheus,
      stopWatchPrometheusQuery,
      cpuQuery,
      memoryQuery,
      podCountQuery,
      projectName,
    ]);

    const cpuUtilization = prometheusResults.getIn([cpuQuery, 'data']) as PrometheusResponse;
    const cpuError = prometheusResults.getIn([cpuQuery, 'loadError']);
    const memoryUtilization = prometheusResults.getIn([memoryQuery, 'data']) as PrometheusResponse;
    const memoryError = prometheusResults.getIn([cpuQuery, 'loadError']);
    const podCount = prometheusResults.getIn([podCountQuery, 'data']) as PrometheusResponse;
    const podCountError = prometheusResults.getIn([cpuQuery, 'loadError']);

    const cpuStats = getRangeVectorStats(cpuUtilization);
    const memoryStats = getRangeVectorStats(memoryUtilization);
    const podCountStats = getRangeVectorStats(podCount);

    return (
      <DashboardCard>
        <DashboardCardHeader>
          <DashboardCardTitle>Utilization Card</DashboardCardTitle>
        </DashboardCardHeader>
        <DashboardCardBody>
          <UtilizationBody timestamps={cpuStats.map((stat) => stat.x as Date)}>
            <UtilizationItem
              title="CPU"
              data={cpuStats}
              isLoading={!cpuUtilization}
              humanizeValue={humanizeCpuCores}
              query={cpuQuery}
              error={cpuError}
            />
            <UtilizationItem
              title="Memory"
              data={memoryStats}
              isLoading={!memoryUtilization}
              humanizeValue={humanizeDecimalBytes}
              query={memoryQuery}
              error={memoryError}
            />
            <UtilizationItem
              title="Pod count"
              data={podCountStats}
              isLoading={!podCount}
              humanizeValue={humanizeNumber}
              query={podCountQuery}
              error={podCountError}
            />
          </UtilizationBody>
        </DashboardCardBody>
      </DashboardCard>
    );
  },
);

type UtilizationCardProps = DashboardItemProps & {
  projectName: string;
};
