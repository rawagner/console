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
import { FirehoseResource } from '../../utils';
import { PrometheusResponse } from '../../graphs';
import { PrometheusRulesResponse } from '../../monitoring';
import { getClusterUpdateStatus, ClusterVersionKind, ClusterUpdateStatus, referenceForModel, hasAvailableUpdates } from '../../../module/k8s';
import { ClusterVersionModel } from '../../../models';
import { clusterUpdateModal } from '../../modals/cluster-update-modal';
import { ArrowCircleUpIcon } from '@patternfly/react-icons';

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
  query,
  healthHandler,
  resource,
}: PrometheusHealthItemProps) => {
  React.useEffect(() => {
    watchPrometheus(query);
    if (resource) {
      watchK8sResource(resource);
    }
    return () => {
      stopWatchPrometheusQuery(query);
      if (resource) {
        stopWatchK8sResource(resource);
      }
    };
  }, [watchK8sResource, stopWatchK8sResource, resource, watchPrometheus, stopWatchPrometheusQuery, query]);

  const healthResult = prometheusResults.getIn([query, 'data']) as PrometheusResponse;
  const healthResultError = prometheusResults.getIn([query, 'loadError']);

  const k8sResult = resource ? resources[resource.prop] : null;
  const healthState = healthHandler(healthResult, healthResultError, k8sResult);

  return <HealthItem title={title} state={healthState.state} details={healthState.message} />;
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
            {subsystems.map(subsystem => isDashboardsOverviewHealthURLSubsystem(subsystem)
              ? <URLHealthItem
                title={subsystem.properties.title}
                url={subsystem.properties.url}
                fetch={subsystem.properties.fetch}
                healthHandler={subsystem.properties.healthHandler}
              />
              : <PrometheusHealthItem
                resource={subsystem.properties.resource}
                title={subsystem.properties.title}
                query={subsystem.properties.query}
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
  query: string;
  title: string;
  healthHandler: HealthHandler<PrometheusResponse>;
  resource?: FirehoseResource;
};
