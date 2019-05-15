import * as React from 'react';
import { OverviewDashboard } from './overview-dashboard/overview-dashboard';
import { HorizontalNav, PageHeading } from './utils';

const pages = [
  {
    href: '',
    name: 'Overview',
    component: OverviewDashboard,
  },
  // TODO add extension point to add other dashboards
];

export const DashboardsPage: React.FC<DashboardsPageProps> = ({ match }) => (
  <React.Fragment>
    <PageHeading title="Dashboards" detail={true} />
    <HorizontalNav match={match} pages={pages} noStatusBox />
  </React.Fragment>
);

export type DashboardsPageProps = {
  match: any,
};
