import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';

import { OverviewDashboard } from './overview-dashboard/overview-dashboard';
import { HorizontalNav, PageHeading, LoadingBox } from '../utils';
import * as k8sActions from '../../actions/k8s';

const tabs = [
  {
    href: '',
    name: 'Overview',
    component: OverviewDashboard,
  },
];

const _DashboardsPage: React.FC<DashboardsPageProps> = ({ match, clearK8s, kindsInFlight }) => {
  React.useEffect(clearK8s, [clearK8s]);
  return kindsInFlight
    ? <LoadingBox />
    : (
      <>
        <PageHeading title="Dashboards" detail={true} />
        <HorizontalNav match={match} pages={tabs} noStatusBox />
      </>
    );
};

const mapDispatchToProps = dispatch => ({
  clearK8s: () => dispatch(k8sActions.clearGrouped('dashboard')),
});

const mapStateToProps = ({k8s}) => ({
  kindsInFlight: k8s.getIn(['RESOURCES', 'inFlight']),
});

export const DashboardsPage = connect(mapStateToProps, mapDispatchToProps)(_DashboardsPage);

type DashboardsPageProps = RouteComponentProps & {
  clearK8s: () => void;
  kindsInFlight: boolean;
};
