import * as React from 'react';
import { connect } from 'react-redux';
import { Map as ImmutableMap } from 'immutable';

import { OverviewHealthSubsystem, isOverviewHealthUrlSubsystem, isOverviewHealthPrometheusSubsystem } from '@console/plugin-sdk';

import * as plugins from '../../../plugins';
import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardTitleSeeAll,
} from '../../dashboard/dashboard-card';
import { HealthBody, HealthItem, OK_STATE, ERROR_STATE, WARNING_STATE, LOADING_STATE } from '../../dashboard/health-card';
import { coFetch } from '../../../co-fetch';
import { featureReducerName } from '../../../reducers/features';
import { FLAGS } from '../../../const';
import { withDashboardResources, WatchUrl, WatchPrometheus } from '../with-dashboard-resources';
import { RootState } from '../../../redux';

export const OCP_HEALTHY = 'OpenShift is healthy';
export const OCP_ERROR = 'Openshift is in error state';

export const K8S_HEALTHY = 'Kubernetes is healthy';
export const K8S_ERROR = 'Kubernetes is in error state';

const getClusterHealth = subsystemStates => {
  let healthState = { state: OK_STATE, message: 'Cluster is healthy', details: null };
  const sortedStates = {
    errorStates: [],
    warningStates: [],
    loadingStates: [],
  };

  subsystemStates.forEach(state => {
    switch (state.state) {
      case ERROR_STATE:
        sortedStates.errorStates.push(state);
        break;
      case WARNING_STATE:
        sortedStates.warningStates.push(state);
        break;
      case LOADING_STATE:
        sortedStates.loadingStates.push(state);
        break;
      default:
        break;
    }
  });

  if (sortedStates.loadingStates.length > 0) {
    healthState = { state: LOADING_STATE, message: null, details: null };
  } else if (sortedStates.errorStates.length > 0) {
    healthState =
      sortedStates.errorStates.length === 1
        ? sortedStates.errorStates[0]
        : { state: ERROR_STATE, message: 'Multiple errors', details: 'Cluster health is degraded' };
  } else if (sortedStates.warningStates.length > 0) {
    healthState =
      sortedStates.warningStates.length === 1
        ? sortedStates.warningStates[0]
        : { state: WARNING_STATE, message: 'Multiple warnings', details: 'Cluster health is degraded' };
  }

  return healthState;
};

const getK8sHealthState = (isOpenshift: boolean, k8sHealth: any): HealthState => {
  if (!k8sHealth) {
    return { state: LOADING_STATE };
  }
  return k8sHealth === 'ok'
    ? { message: isOpenshift ? OCP_HEALTHY : K8S_HEALTHY, state: OK_STATE }
    : { message: isOpenshift ? OCP_ERROR: K8S_ERROR, state: ERROR_STATE };
};

const mapStateToProps = (state: RootState) => ({
  isOpenshift: state[featureReducerName].get(FLAGS.OPENSHIFT),
});

export const HealthCard = withDashboardResources(connect(mapStateToProps)(
  class HealthCard extends React.Component<HealthProps> {
    private subsystems: OverviewHealthSubsystem[];

    constructor(props) {
      super(props);
      this.subsystems = plugins.registry.getOverviewHealthSubsystems();
    }

    componentDidMount() {
      this.props.watchUrl('healthz', coFetch, response => response.text());
      this.subsystems.filter(isOverviewHealthUrlSubsystem).forEach(subsystem => {
        const { url, fetchMethod, responseHandler } = subsystem.properties;
        this.props.watchUrl(url, fetchMethod, responseHandler);
      });
      this.subsystems.filter(isOverviewHealthPrometheusSubsystem).forEach(subsystem => {
        const { query } = subsystem.properties;
        this.props.watchPrometheus(query);
      });
    }

    render() {
      const k8sHealth = this.props.urlResults.getIn(['healthz', 'result']);
      const k8sHealthState = getK8sHealthState(this.props.isOpenshift, k8sHealth);

      const subsystemsHealths = this.subsystems.map(subsystem => {
        let result;
        if (isOverviewHealthPrometheusSubsystem(subsystem)) {
          result = this.props.prometheusResults.getIn([subsystem.properties.query, 'result']);
        } else {
          result = this.props.urlResults.getIn([subsystem.properties.url, 'result']);
        }
        return subsystem.properties.healthHandler(result);
      });

      const healthState = getClusterHealth([k8sHealthState, ...subsystemsHealths]);

      let seeAll;
      if (this.subsystems.length > 0) {
        seeAll = (
          <DashboardCardTitleSeeAll title="See All">
            <div className="co-health-card__subsystem-body">
              <HealthItem
                message={this.props.isOpenshift ? 'Openshift' : 'Kubernetes'}
                details={k8sHealthState.message}
                state={k8sHealthState.state}
              />
              {subsystemsHealths.map((subsystem, index) => (
                <div key={index}>
                  <div className="co-health-card__separator" />
                  <HealthItem
                    message={this.subsystems[index].properties.title}
                    details={subsystem.message}
                    state={subsystem.state}
                  />
                </div>
              ))}
            </div>
          </DashboardCardTitleSeeAll>
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
    }
  }
));

export type GetHealthStateFunction = {
  (health: any): HealthState,
};

export type HealthState = {
  message?: string,
  state: string,
};

type HealthProps = {
  watchUrl: WatchUrl,
  watchPrometheus: WatchPrometheus,
  prometheusResults: ImmutableMap<string, any>,
  urlResults: ImmutableMap<string, any>,
  isOpenshift: boolean,
};
