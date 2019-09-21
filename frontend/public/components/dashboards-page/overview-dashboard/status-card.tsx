import * as React from 'react';
import * as _ from 'lodash-es';
import { isDashboardsOverviewHealthURLSubsystem } from '@console/plugin-sdk';
import { Button } from 'patternfly-react';
import { ArrowCircleUpIcon } from '@patternfly/react-icons';
import { Gallery, GalleryItem } from '@patternfly/react-core';
import { ExtensionProperties } from '@console/plugin-sdk/src/typings/dashboards';
import { DashboardCardHeader, DashboardCard, DashboardCardTitle, DashboardCardBody } from '../../dashboard/dashboard-card';
import { AlertsBody, StatusBody } from '../../dashboard/status-card/status-body';
import { HealthBody } from '../../dashboard/status-card/health-body';
import { HealthItem } from '../../dashboard/status-card/health-item';
import { withDashboardResources, DashboardItemProps } from '../with-dashboard-resources';
import { getAlerts } from '../../dashboard/health-card';
import { AlertItem, StatusItem } from '../../dashboard/status-card/alert-item';
import { ALERTS_KEY } from '../../../actions/dashboards';
import { connectToFlags, FlagsObject } from '../../../reducers/features';
import { getFlagsForExtensions, isDashboardExtensionInUse } from '../utils';
import * as plugins from '../../../plugins';
import { FirehoseResource, AsyncComponent } from '../../utils';
import { PrometheusResponse } from '../../graphs';
import { PrometheusRulesResponse } from '../../monitoring';
import { ClusterVersionKind, referenceForModel, hasAvailableUpdates } from '../../../module/k8s';
import { ClusterVersionModel } from '../../../models';
import { clusterUpdateModal } from '../../modals/cluster-update-modal';

const getSubsystems = (flags: FlagsObject) =>
  plugins.registry.getDashboardsOverviewHealthSubsystems().filter(e => isDashboardExtensionInUse(e, flags));

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
}: DashboardItemProps & ExtensionProperties.DashboardsOverviewHealthURLSubsystem<any>) => {
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
  popupComponent,
  popupTitle,
}: DashboardItemProps & ExtensionProperties.DashboardsOverviewHealthPrometheusSubsystem) => {
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
  const healthState = healthHandler(queryResults, queryErrors, k8sResult);

  const PopupComponentCallback = popupComponent ? React.useCallback(() =>
    <AsyncComponent loader={popupComponent} results={queryResults} errors={queryErrors} />,
  [queryResults, queryErrors, popupComponent]
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
      {(hasAvailableUpdates(cv) || alerts.length) && (
        <>
          {hasAvailableUpdates(cv) && (
            <StatusItem
              Icon={UpdateIcon}
              message="A cluster version update is available"
              LinkComponent={LinkComponent}
            />
          )}
          {alerts.map(alert => <AlertItem key={alert.fingerprint} alert={alert} />)}
        </>
      )}
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
            <Gallery className="co-overview-status__health" gutter="md">
              {subsystems.map(subsystem => (
                <GalleryItem key={subsystem.properties.title}>
                  {isDashboardsOverviewHealthURLSubsystem(subsystem) ? (
                    <URLHealthItem
                      title={subsystem.properties.title}
                      url={subsystem.properties.url}
                      fetch={subsystem.properties.fetch}
                      healthHandler={subsystem.properties.healthHandler}
                    />
                  ) : (
                    <PrometheusHealthItem
                      resource={subsystem.properties.resource}
                      title={subsystem.properties.title}
                      queries={subsystem.properties.queries}
                      healthHandler={subsystem.properties.healthHandler}
                      popupComponent={subsystem.properties.popupComponent}
                      popupTitle={subsystem.properties.popupTitle}
                    />
                  )}
                </GalleryItem>
              ))}
            </Gallery>
          </HealthBody>
          <ClusterAlerts />
        </StatusBody>
      </DashboardCardBody>
    </DashboardCard>
  );
});
