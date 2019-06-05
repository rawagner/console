import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';

import { OverviewDashboard } from './overview-dashboard/overview-dashboard';
import { HorizontalNav, PageHeading } from '../utils';
import * as k8sActions from '../../actions/k8s';

const tabs = [
  {
    href: '',
    name: 'Overview',
    component: OverviewDashboard,
  },
  // TODO add extension point to add other dashboards
];

const _DashboardsPage: React.FC<DashboardsPageProps> = ({ match, clearK8s }) => {
  React.useEffect(() => clearK8s);
  return (
    <React.Fragment>
      <PageHeading title="Dashboards" detail={true} />
      <HorizontalNav match={match} pages={tabs} noStatusBox />
    </React.Fragment>
  );
};

const mapDispatchToProps = dispatch => ({
  clearK8s: () => dispatch(k8sActions.clearNamespaced('dashboard')),
});

export const DashboardsPage = connect(null, mapDispatchToProps)(_DashboardsPage);

type DashboardsPageProps = RouteComponentProps & {
  clearK8s: any;
}