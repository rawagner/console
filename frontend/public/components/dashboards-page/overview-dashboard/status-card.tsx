import * as React from 'react';
import * as _ from 'lodash-es';
import { isDashboardsOverviewHealthURLSubsystem, HealthHandler } from '@console/plugin-sdk';
import { Button } from 'patternfly-react';
import { DashboardCardHeader, DashboardCard, DashboardCardTitle, DashboardCardBody } from '../../dashboard/dashboard-card';
import { AlertsBody, StatusBody } from '../../dashboard/status-card/status-body';
import { HealthBody } from '../../dashboard/status-card/health-body';
import { HealthItem } from '../../dashboard/status-card/health-item';
import { withDashboardResources, DashboardItemProps } from '../with-dashboard-resources';
import { HealthState } from '../../dashboard/health-card/states';
import { coFetch } from '../../../co-fetch';
import { getAlerts } from '../../dashboard/health-card';
import { AlertItem, StatusItem } from '../../dashboard/status-card/alert-item';
import { ALERTS_KEY } from '../../../actions/dashboards';
import { connectToFlags, FlagsObject } from '../../../reducers/features';
import { getFlagsForExtensions, isDashboardExtensionInUse } from '../utils';
import * as plugins from '../../../plugins';
import { FirehoseResource, humanizePercentage } from '../../utils';
import { PrometheusResponse } from '../../graphs';
import { PrometheusRulesResponse } from '../../monitoring';
import { getClusterUpdateStatus, ClusterVersionKind, ClusterUpdateStatus, referenceForModel, hasAvailableUpdates } from '../../../module/k8s';
import { ClusterVersionModel } from '../../../models';
import { clusterUpdateModal } from '../../modals/cluster-update-modal';
import { ArrowCircleUpIcon, UnknownIcon } from '@patternfly/react-icons';
import { YellowExclamationTriangleIcon, RedExclamationCircleIcon, GreenCheckCircleIcon } from '@console/shared';

const getSubsystems = (flags: FlagsObject) =>
  plugins.registry.getDashboardsOverviewHealthSubsystems().filter(e => isDashboardExtensionInUse(e, flags));

const fetchK8sHealth = async(url: string) => {
  const response = await coFetch(url);
  return response.text();
};

const getK8sHealthState: HealthHandler<string> = (k8sHealth, error, resource) => {
  if (error) {
    return { state: HealthState.UNKNOWN };
  }
  if (!k8sHealth || !_.get(resource, 'loaded')) {
    return { state: HealthState.LOADING };
  }
  if (getClusterUpdateStatus(_.get(resource, 'data') as ClusterVersionKind) === ClusterUpdateStatus.ErrorRetrieving) {
    return { state: HealthState.UPDATING, message: 'Updating' };
  }
  return { state: k8sHealth === 'ok' ? HealthState.OK : HealthState.ERROR };
};

const controlPlaneQueries = [
  '(sum(up{job="apiserver"} == 1) / count(up{job="apiserver"})) * 100',
  '(sum(up{job="kube-controller-manager"} == 1) / count(up{job="kube-controller-manager"})) * 100',
  '(sum(up{job="scheduler"} == 1) / count(up{job="scheduler"})) * 100',
  'sum(rate(apiserver_request_count{code=~"2.."}[5m])) / sum(rate(apiserver_request_count[5m])) * 100',
];

const getControlPlaneComponentHealth: HealthHandler<PrometheusResponse> = (response, error) => {
  if (error) {
    return { state: HealthState.UNKNOWN, message: 'Not available' };
  }
  if (!response) {
    return { state: HealthState.LOADING };
  }
  const perc = humanizePercentage(_.get(response, 'data.result[0].value[1]'));
  if (perc.value > 90 ) {
    return { state: HealthState.OK, message: perc.string };
  } else if (perc.value > 70) {
    return { state: HealthState.WARNING, message: perc.string };
  }
  return { state: HealthState.ERROR, message: perc.string };
};

const getControlPlaneHealth: HealthHandler<PrometheusResponse[]> = (responses = [], error: Array<any>) => {
  const componentsHealth = responses.map((r, index) => getControlPlaneComponentHealth(r, error[index]));
  if (componentsHealth.some(c => c.state === HealthState.LOADING)) {
    return { state: HealthState.LOADING };
  }
  const errComponents = componentsHealth.filter(c =>
    c.state === HealthState.WARNING || c.state === HealthState.ERROR || c.state === HealthState.UNKNOWN
  );
  if (errComponents.length) {
    return { state: HealthState.WARNING, message: `${errComponents.length} components degraded` };
  }
  return { state: HealthState.OK };
};

const ResponseRate: React.FC<ResponseRateProps> = ({ response, children, error }) => {
  const health = getControlPlaneComponentHealth(response, error);
  let icon: React.ReactNode;
  if (health.state === HealthState.UNKNOWN) {
    icon = <UnknownIcon className="text-secondary" />;
  } else if (health.state === HealthState.LOADING) {
    icon = <div className="skeleton-health" />;
  } else if (health.state === HealthState.OK) {
    icon = <GreenCheckCircleIcon />;
  } else if (health.state === HealthState.WARNING) {
    icon = <YellowExclamationTriangleIcon />;
  } else if (health.state === HealthState.ERROR) {
    icon = <RedExclamationCircleIcon />;
  }
  return (
    <div className="co-dashboard-card__control-plane-popup">
      <div>{children}</div>
      <div className="co-dashboard-card__response-rate">
        <div className="co-dashboard-card__response-rate-text text-secondary">{health.message}</div>
        {icon}
      </div>
    </div>
  );
};

const ControlPlanePopup = ({ results, errors }) => (
  <>
    <div className="co-dashboard-card__control-plane-description">Components of the Control Plane are responsible for maintaining and reconcilling the state of the cluster.</div>
    <div className="co-dashboard-card__control-plane-popup">
      <div className="co-dashboard-card__control-plane-components">Components</div>
      <div className="text-secondary">Response rate</div>
    </div>
    <ResponseRate response={results[0]} error={errors[0]}>
      API Servers
    </ResponseRate>
    <ResponseRate response={results[1]} error={errors[1]}>
      Controller Managers
    </ResponseRate>
    <ResponseRate response={results[2]} error={errors[2]}>
      Schedulers
    </ResponseRate>
    <ResponseRate response={results[3]} error={errors[3]}>
      API Request Success Rate
    </ResponseRate>
  </>
);

const URLHealthItem = withDashboardResources(({
  watchURL,
  stopWatchURL,
  urlResults,
  title,
  url,
  fetch,
  healthHandler,
  resource,
  resources,
  watchK8sResource,
  stopWatchK8sResource,
}: URLHealthItemProps) => {
  React.useEffect(() => {
    watchURL(url, fetch);
    if (resource) {
      watchK8sResource(resource);
    }
    return () => {
      stopWatchURL(url);
      if (resource) {
        stopWatchK8sResource(resource);
      }
    };
  }, [watchURL, stopWatchURL, url, fetch, resource, watchK8sResource, stopWatchK8sResource]);

  const healthResult = urlResults.getIn([url, 'data']);
  const healthResultError = urlResults.getIn([url, 'loadError']);

  const k8sResult = resource ? resources[resource.prop] : null;
  const healthState = healthHandler(healthResult, healthResultError, k8sResult);

  return <HealthItem title={title} state={healthState.state} details={healthState.message} />;
});

const PrometheusHealthItem = withDashboardResources(({
  watchK8sResource,
  stopWatchK8sResource,
  resources,
  watchPrometheus,
  stopWatchPrometheusQuery,
  prometheusResults,
  title,
  queries = [],
  healthHandler,
  resource,
  PopupComponent,
  popupTitle,
}: PrometheusHealthItemProps) => {
  React.useEffect(() => {
    queries.forEach(q => watchPrometheus(q));
    if (resource) {
      watchK8sResource(resource);
    }
    return () => {
      queries.forEach(q => stopWatchPrometheusQuery(q));
      if (resource) {
        stopWatchK8sResource(resource);
      }
    };
  }, [watchK8sResource, stopWatchK8sResource, resource, watchPrometheus, stopWatchPrometheusQuery, queries]);

  const queryResults = queries.map(q => prometheusResults.getIn([q, 'data']) as PrometheusResponse);
  const queryErrors = queries.map(q => prometheusResults.getIn([q, 'loadError']));

  const k8sResult = resource ? resources[resource.prop] : null;
  const healthState = healthHandler(queryResults, queryErrors.some(e => !!e), k8sResult);

  const PopupComponentCallback = PopupComponent ? React.useCallback(() =>
    <PopupComponent results={queryResults} errors={queryErrors} />,
  [queryResults, queryErrors]
  ) : null;

  return (
    <HealthItem
      title={title}
      state={healthState.state}
      details={healthState.message}
      popupTitle={popupTitle}
      PopupComponent={PopupComponentCallback}
    />
  );
}
);

const cvResource: FirehoseResource = {
  kind: referenceForModel(ClusterVersionModel),
  namespaced: false,
  name: 'version',
  isList: false,
  prop: 'cv',
};

const ClusterAlerts = withDashboardResources(({
  watchAlerts,
  stopWatchAlerts,
  alertsResults,
  watchK8sResource,
  stopWatchK8sResource,
  resources,
}) => {
  React.useEffect(() => {
    watchAlerts();
    watchK8sResource(cvResource);
    return () => {
      stopWatchAlerts();
      stopWatchK8sResource(cvResource);
    };
  }, [watchAlerts, stopWatchAlerts, watchK8sResource, stopWatchK8sResource]);

  const alertsResponse = alertsResults.getIn([ALERTS_KEY, 'data']) as PrometheusRulesResponse;
  const alertsResponseError = alertsResults.getIn([ALERTS_KEY, 'loadError']);
  const alerts = getAlerts(alertsResponse);

  const cv = _.get(resources.cv, 'data') as ClusterVersionKind;
  const LinkComponent = React.useCallback(() => (
    <Button className="co-status-card__link-button" bsStyle="link" onClick={() => clusterUpdateModal({cv})}>
      View details
    </Button>
  ), [cv]);
  const UpdateIcon = React.useCallback(() => <ArrowCircleUpIcon className="update-pending" />, []);

  return (
    <AlertsBody isLoading={!alertsResponse} error={alertsResponseError}>
      <>
      {!hasAvailableUpdates(cv) && (
        <StatusItem
          Icon={UpdateIcon}
          message="A cluster version update is available"
          LinkComponent={LinkComponent}
        />
      )}
      {alerts.map(alert => <AlertItem key={alert.fingerprint} alert={alert} />)}
      </>
    </AlertsBody>
  );
});

export const StatusCard = connectToFlags(
  ...getFlagsForExtensions(plugins.registry.getDashboardsOverviewHealthSubsystems())
)(({ flags }) => {
  const subsystems = getSubsystems(flags);
  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>Status</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardBody>
        <StatusBody>
          <HealthBody>
            <URLHealthItem
              title="Cluster"
              url="healthz"
              fetch={fetchK8sHealth}
              healthHandler={getK8sHealthState}
              resource={cvResource}
            />
            <PrometheusHealthItem
              title="Control Plane"
              queries={controlPlaneQueries}
              healthHandler={getControlPlaneHealth}
              PopupComponent={ControlPlanePopup}
              popupTitle="Control Plane status"
            />
            {subsystems.map(subsystem => isDashboardsOverviewHealthURLSubsystem(subsystem)
              ? <URLHealthItem
                key={subsystem.properties.title}
                title={subsystem.properties.title}
                url={subsystem.properties.url}
                fetch={subsystem.properties.fetch}
                healthHandler={subsystem.properties.healthHandler}
              />
              : <PrometheusHealthItem
                key={subsystem.properties.title}
                resource={subsystem.properties.resource}
                title={subsystem.properties.title}
                queries={subsystem.properties.queries}
                healthHandler={subsystem.properties.healthHandler}
              />
            )}
          </HealthBody>
          <ClusterAlerts />
        </StatusBody>
      </DashboardCardBody>
    </DashboardCard>
  );
});

type URLHealthItemProps = DashboardItemProps & {
  url: string;
  fetch: any;
  title: string;
  healthHandler: HealthHandler<any>;
  resource?: FirehoseResource;
};

type PrometheusHealthItemProps = DashboardItemProps & {
  queries: string[];
  title: string;
  healthHandler: HealthHandler<PrometheusResponse[]>;
  resource?: FirehoseResource;
  PopupComponent?: React.ComponentType<any>;
  popupTitle?: string;
};

type ResponseRateProps = {
  response: PrometheusResponse;
  children: React.ReactNode;
  error: boolean;
};
