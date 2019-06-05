import * as React from 'react';
import * as _ from 'lodash-es';
import { Map as ImmutableMap } from 'immutable';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '../../dashboard/dashboard-card';
import { DetailsBody, DetailItem } from '../../dashboard/details-card';
import { withDashboardResources, WatchPrometheus, StopWatchPrometheus } from '../with-dashboard-resources';
import { InfrastructureModel } from '../../../models';

const getClusterName = (infrastructure): string => {
  if (!infrastructure) {
    return null;
  }
  const apiServerURL = infrastructure.getIn(['status', 'apiServerURL']);
  let clusterName;
  if (apiServerURL) {
    clusterName = apiServerURL.replace('https://api.', '');
    const portIndex = clusterName.indexOf(':');
    if (portIndex !== -1) {
      clusterName = clusterName.slice(0, portIndex);
    }
  }
  return clusterName;
};

const getInfrastructurePlatform = (infrastructure): string => infrastructure ? infrastructure.getIn(['status','platform']): null;

const getOpenshiftVersion = (openshiftClusterVersionResponse): string => {
  const result = _.get(openshiftClusterVersionResponse, 'data.result', []);

  // if cluster has more nodes, we take the version for the fist one
  const firstCluster = Array.isArray(result) ? result[0] : result;
  if (firstCluster) {
    return _.get(firstCluster, 'metric.gitVersion');
  }
  return null;
};

const OPENSHIFT_VERSION_QUERY = 'openshift_build_info{job="apiserver"}';

const infrastructureResource = {
  kind: InfrastructureModel.kind,
  namespaced: false,
  name: 'cluster',
  isList: false,
  prop: 'infrastructure',
};

export const _DetailsCard: React.FC<DetailsCardProps> = ({
  watchPrometheus,
  stopWatchPrometheusQuery,
  watchK8sResource,
  stopWatchK8sResource,
  prometheusResults,
  k8sResources,
}) => {
  React.useEffect(() => {
    watchPrometheus(OPENSHIFT_VERSION_QUERY);
    watchK8sResource(infrastructureResource);
    return () => {
      stopWatchPrometheusQuery(OPENSHIFT_VERSION_QUERY);
      stopWatchK8sResource(infrastructureResource);
    };
  }, [watchPrometheus, stopWatchPrometheusQuery, watchK8sResource, stopWatchK8sResource]);
  const openshiftClusterVersionResponse = prometheusResults.getIn([OPENSHIFT_VERSION_QUERY], 'result');
  const infrastructure = k8sResources.infrastructure;
  return (
    <DashboardCard className="co-details-card">
      <DashboardCardHeader>
        <DashboardCardTitle>Details</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardBody>
        <DetailsBody>
          <DetailItem
            key="name"
            title="Name"
            value={getClusterName(infrastructure)}
            isLoading={!infrastructure}
          />
          <DetailItem
            key="provider"
            title="Provider"
            value={getInfrastructurePlatform(infrastructure)}
            isLoading={!infrastructure}
          />
          <DetailItem
            key="openshift"
            title="OpenShift version"
            value={getOpenshiftVersion(openshiftClusterVersionResponse)}
            isLoading={!openshiftClusterVersionResponse}
          />
        </DetailsBody>
      </DashboardCardBody>
    </DashboardCard>
  );
};

type DetailsCardProps = {
  watchPrometheus: WatchPrometheus;
  stopWatchPrometheusQuery: StopWatchPrometheus;
  watchK8sResource: any;
  prometheusResults: ImmutableMap<string, any>;
  k8sResources: any;
  stopWatchK8sResource: any;
}

export const DetailsCard = withDashboardResources(_DetailsCard);
