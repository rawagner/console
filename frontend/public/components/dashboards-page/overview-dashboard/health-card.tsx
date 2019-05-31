import * as React from 'react';
import { connect } from 'react-redux';
import { Map as ImmutableMap } from 'immutable';

import * as plugins from '../../../plugins';
import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardSeeAll,
} from '../../dashboard/dashboard-card';
import { HealthBody, HealthItem } from '../../dashboard/health-card';
import { OK_STATE, ERROR_STATE, WARNING_STATE, LOADING_STATE } from '../../dashboard/health-card/states';
import { coFetch } from '../../../co-fetch';
import { featureReducerName } from '../../../reducers/features';
import { FLAGS } from '../../../const';
import { withDashboardResources, WatchURL, WatchPrometheus, StopWatchURL, StopWatchPrometheus } from '../with-dashboard-resources';
import { RootState } from '../../../redux';
import { getBrandingDetails } from '../../masthead';
import { PodModel } from '../../../models';

export const HEALTHY = 'is healthy';
export const ERROR = 'is in an error state';

const getClusterHealth = (subsystemStates: Array<HealthState>): ClusterHealth => {
  let healthState: ClusterHealth = { state: OK_STATE, message: 'Cluster is healthy' };
  const subsystemBySeverity = {
    error: subsystemStates.filter(subsystem => subsystem.state === ERROR_STATE),
    warning: subsystemStates.filter(subsystem => subsystem.state === WARNING_STATE),
    loading: subsystemStates.filter(subsystem => subsystem.state === LOADING_STATE),
  };

  if (subsystemBySeverity.loading.length > 0) {
    healthState = { state: LOADING_STATE, message: null };
  } else if (subsystemBySeverity.error.length > 0) {
    healthState =
      subsystemBySeverity.error.length === 1
        ? subsystemBySeverity.error[0]
        : { state: ERROR_STATE, message: 'Multiple errors', details: 'Cluster health is degraded' };
  } else if (subsystemBySeverity.warning.length > 0) {
    healthState =
      subsystemBySeverity.warning.length === 1
        ? subsystemBySeverity.warning[0]
        : { state: WARNING_STATE, message: 'Multiple warnings', details: 'Cluster health is degraded' };
  }

  return healthState;
};

const getName = (isOpenShift: boolean): string => isOpenShift ? getBrandingDetails().productName : 'Kubernetes';

const getK8sHealthState = (isOpenShift: boolean, k8sHealth: any): HealthState => {
  if (!k8sHealth) {
    return { state: LOADING_STATE };
  }
  return k8sHealth === 'ok'
    ? { message: `${getName(isOpenShift)} ${HEALTHY}`, state: OK_STATE }
    : { message: `${getName(isOpenShift)} ${ERROR}`, state: ERROR_STATE };
};

const mapStateToProps = (state: RootState) => ({
  isOpenShift: state[featureReducerName].get(FLAGS.OPENSHIFT),
});

const fetchK8sHealth = async(url) => {
  const response = await coFetch(url);
  return response.text();
};

const _HealthCard: React.FC<HealthProps> = ({
  watchURL,
  stopWatchURL,
  watchPrometheus,
  stopWatchPrometheusQuery,
  urlResults,
  prometheusResults,
  isOpenShift,
  watchK8sResource,
}) => {
  React.useEffect(() => {
    watchK8sResource({kind: PodModel.kind});
    const subsystems = plugins.registry.getOverviewHealthSubsystems();
    watchURL('healthz', fetchK8sHealth);

    subsystems.filter(plugins.isOverviewHealthURLSubsystem).forEach(subsystem => {
      const { url, fetch } = subsystem.properties;
      watchURL(url, fetch);
    });
    subsystems.filter(plugins.isOverviewHealthPrometheusSubsystem).forEach(subsystem => {
      const { query } = subsystem.properties;
      watchPrometheus(query);
    });
    return () => {
      stopWatchURL('healtz');

      subsystems.filter(plugins.isOverviewHealthURLSubsystem).forEach(subsystem =>
        stopWatchURL(subsystem.properties.url)
      );
      subsystems.filter(plugins.isOverviewHealthPrometheusSubsystem).forEach(subsystem =>
        stopWatchPrometheusQuery(subsystem.properties.query)
      );
    };
  }, [watchURL, stopWatchURL, watchPrometheus, stopWatchPrometheusQuery]);

  const subsystems = plugins.registry.getOverviewHealthSubsystems();
  const k8sHealth = urlResults.getIn(['healthz', 'result']);
  const k8sHealthState = getK8sHealthState(isOpenShift, k8sHealth);

  const subsystemsHealths = subsystems.map(subsystem => {
    let result;
    if (plugins.isOverviewHealthPrometheusSubsystem(subsystem)) {
      result = prometheusResults.getIn([subsystem.properties.query, 'result']);
    } else {
      result = urlResults.getIn([subsystem.properties.url, 'result']);
    }
    return subsystem.properties.healthHandler(result);
  });

  const healthState = getClusterHealth([k8sHealthState, ...subsystemsHealths]);

  let seeAll;
  if (subsystems.length > 0) {
    seeAll = (
      <DashboardCardSeeAll title="Subsystem health">
        <div className="co-health-card__subsystem-body">
          <HealthItem
            message={getName(isOpenShift)}
            details={k8sHealthState.message}
            state={k8sHealthState.state}
          />
          {subsystemsHealths.map((subsystem, index) => (
            <div key={index}>
              <div className="co-health-card__separator" />
              <HealthItem
                message={subsystems[index].properties.title}
                details={subsystem.message}
                state={subsystem.state}
              />
            </div>
          ))}
        </div>
      </DashboardCardSeeAll>
    );
  }

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>Cluster Health</DashboardCardTitle>
        {seeAll}
      </DashboardCardHeader>
      <DashboardCardBody>
        <HealthBody>
          <HealthItem
            state={healthState.state}
            message={healthState.message}
            details={healthState.details}
          />
        </HealthBody>
      </DashboardCardBody>
    </DashboardCard>
  );
};

export const HealthCard = withDashboardResources(connect(mapStateToProps)(_HealthCard));

type ClusterHealth = {
  state: string;
  message?: string;
  details?: string,
};

export type HealthState = {
  message?: string;
  state: string;
};

type HealthProps = {
  watchURL: WatchURL;
  stopWatchURL: StopWatchURL;
  watchPrometheus: WatchPrometheus;
  stopWatchPrometheusQuery: StopWatchPrometheus;
  prometheusResults: ImmutableMap<string, any>;
  urlResults: ImmutableMap<string, any>;
  isOpenShift: boolean;
  watchK8sResource: any;
  k8sResources: any,
};
