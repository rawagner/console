import * as React from 'react';
import * as _ from 'lodash-es';
import { connect } from 'react-redux';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '../../dashboard/dashboard-card';
import { DetailsBody, DetailItem } from '../../dashboard/details-card';
import { withDashboardResources, DashboardItemProps, FirehoseResource } from '../with-dashboard-resources';
import { InfrastructureModel } from '../../../models';
import { referenceForModel } from '../../../module/k8s';
import { FLAGS } from '../../../const';
import { featureReducerName, flagPending } from '../../../reducers/features';
import { RootState } from '../../../redux';

const OPENSHIFT_VERSION_QUERY = 'openshift_build_info{job="apiserver"}';

const getClusterName = (infrastructure): string => {
  const apiServerURL = _.get(infrastructure, 'status.apiServerURL');
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

const getInfrastructurePlatform = (infrastructure): string => _.get(infrastructure, 'status.platform');

const getOpenshiftVersion = (openshiftClusterVersionResponse): string => {
  const result = _.get(openshiftClusterVersionResponse, 'data.result', []);

  // if cluster has more nodes, we take the version for the fist one
  const firstCluster = Array.isArray(result) ? result[0] : result;
  if (firstCluster) {
    return _.get(firstCluster, 'metric.gitVersion');
  }
  return null;
};

const getKubernetesVersion = (kubernetesVersionResponse): string =>
  _.get(kubernetesVersionResponse, 'gitVersion');

const infrastructureResource: FirehoseResource = {
  kind: referenceForModel(InfrastructureModel),
  namespaced: false,
  name: 'cluster',
  isList: false,
  prop: 'infrastructure',
};

const mapStateToProps = (state: RootState) => ({
  openShiftFlag: state[featureReducerName].get(FLAGS.OPENSHIFT),
});

export const _DetailsCard: React.FC<DetailsCardProps> = ({
  watchURL,
  stopWatchURL,
  watchPrometheus,
  stopWatchPrometheusQuery,
  watchK8sResource,
  stopWatchK8sResource,
  prometheusResults,
  k8sResults,
  urlResults,
  openShiftFlag,
}) => {
  React.useEffect(() => {
    if (!flagPending(openShiftFlag)) {
      if (openShiftFlag) {
        watchPrometheus(OPENSHIFT_VERSION_QUERY);
        watchK8sResource(infrastructureResource);
        return () => {
          stopWatchPrometheusQuery(OPENSHIFT_VERSION_QUERY);
          stopWatchK8sResource(infrastructureResource);
        };
      }
      watchURL('version');
      return () => {
        stopWatchURL('version');
      };
    }
  }, [openShiftFlag, watchPrometheus, stopWatchPrometheusQuery, watchK8sResource, stopWatchK8sResource, watchURL, stopWatchURL]);
  const openshiftClusterVersionResponse = prometheusResults.getIn([OPENSHIFT_VERSION_QUERY, 'result']);
  const infrastructure = k8sResults.infrastructure;
  const kubernetesVersion = urlResults.getIn(['version', 'result']);
  return (
    <DashboardCard className="co-details-card">
      <DashboardCardHeader>
        <DashboardCardTitle>Details</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardBody isLoading={flagPending(openShiftFlag)}>
        <DetailsBody>
          {openShiftFlag ? (
            <>
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
            </>
          ) : (
            <DetailItem
              key="kubernetes"
              title="Kubernetes version"
              value={getKubernetesVersion(kubernetesVersion)}
              isLoading={!kubernetesVersion}
            />
          )}
        </DetailsBody>
      </DashboardCardBody>
    </DashboardCard>
  );
};

type DetailsCardProps = DashboardItemProps & {
  openShiftFlag: boolean;
}

export const DetailsCard = withDashboardResources(connect(mapStateToProps)(_DetailsCard));
