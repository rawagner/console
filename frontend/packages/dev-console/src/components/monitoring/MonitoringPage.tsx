import * as React from 'react';
import { Helmet } from 'react-helmet';
import { match as RMatch } from 'react-router';
import TechPreviewBadge from '@console/shared/src/components/badges/TechPreviewBadge';
import { ALL_NAMESPACES_KEY } from '@console/shared/src/constants/common';
import { history } from '@console/internal/components/utils/router';
import NamespacedPage, { NamespacedPageVariants } from '../NamespacedPage';
import ProjectListPage from '../projects/ProjectListPage';
import ConnectedMonitoringDashboard from './dashboard/MonitoringDashboard';
import ConnectedMonitoringMetrics from './metrics/MonitoringMetrics';
import MonitoringEvents from './events/MonitoringEvents';
import { PageHeading } from '@console/internal/components/utils/headings';
import { HorizontalNav } from '@console/internal/components/utils/horizontal-nav';

export const MONITORING_ALL_NS_PAGE_URI = '/dev-monitoring/all-namespaces';

interface MonitoringPageProps {
  match: RMatch<{
    ns?: string;
  }>;
}

const handleNamespaceChange = (newNamespace: string): void => {
  if (newNamespace === ALL_NAMESPACES_KEY) {
    history.push(MONITORING_ALL_NS_PAGE_URI);
  }
};

export const MonitoringPage: React.FC<MonitoringPageProps> = ({ match }) => {
  const activeNamespace = match.params.ns;

  return (
    <>
      <Helmet>
        <title>Monitoring</title>
      </Helmet>
      <NamespacedPage
        hideApplications
        variant={NamespacedPageVariants.light}
        onNamespaceChange={handleNamespaceChange}
      >
        {activeNamespace ? (
          <>
            <PageHeading badge={<TechPreviewBadge />} title="Monitoring" />
            <HorizontalNav
              pages={[
                {
                  href: '',
                  name: 'Dashboard',
                  component: ConnectedMonitoringDashboard,
                },
                {
                  href: 'metrics',
                  name: 'Metrics',
                  component: ConnectedMonitoringMetrics,
                },
                {
                  href: 'events',
                  name: 'Events',
                  component: MonitoringEvents,
                },
              ]}
              match={match}
              noStatusBox
            />
          </>
        ) : (
          <ProjectListPage badge={<TechPreviewBadge />} title="Monitoring">
            Select a project to view monitoring metrics
          </ProjectListPage>
        )}
      </NamespacedPage>
    </>
  );
};

export default MonitoringPage;
