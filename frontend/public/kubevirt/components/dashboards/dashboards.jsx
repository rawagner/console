import React from 'react';
import { connect } from 'react-redux';

import { types } from '../dashboards/dashboard-actions';

import { k8sBasePath } from '../../module/okdk8s';
import { ClusterOverviewConnected } from '../cluster/cluster-overview';
import { HorizontalNav, PageHeading } from '../utils/okdutils';
import { StorageOverviewConnected } from '../../../storage/components/storage-overview/storage-overview';
import { coFetchJSON } from '../../../co-fetch';

export const REFRESH_TIMEOUT = 5000;

export const getPrometheusBaseURL = () => window.SERVER_FLAGS.prometheusBaseURL;

export const getAlertManagerBaseURL = () => window.SERVER_FLAGS.alertManagerBaseURL;

export const getPrometheusMetrics = async() => {
  const url = `${getPrometheusBaseURL()}/api/v1/label/__name__/values`;
  return coFetchJSON(url);
};

export const getPrometheusQuery = async(query) => {
  const url = `${getPrometheusBaseURL()}/api/v1/query?query=${encodeURIComponent(query)}`;
  return coFetchJSON(url);
};

export const fetchPeriodically = async(url, onFetch, responseHandler, fetchMethod = coFetchJSON) => {
  let response;
  try {
    response = await fetchMethod(url);
    if (responseHandler) {
      response = await responseHandler(response);
    }
  } catch (error) {
    response = error;
  } finally {
    onFetch(response);
    setTimeout(() => fetchPeriodically(url, onFetch, responseHandler, fetchMethod), REFRESH_TIMEOUT);
  }
};

class Dashboards extends React.Component {
  constructor(props) {
    super(props);
    this.fetchPrometheusQueries = this._fetchPrometheusQueries.bind(this);
    this.fetchAlerts = this._fetchAlerts.bind(this);
    this.fetchUrl = this._fetchUrl.bind(this);
    this.fetchPeriodically = this._fetchPeriodically.bind(this);
    this.clearTimeouts = this._clearTimeouts.bind(this);
    this.timeouts = {};
  }

  _clearTimeouts() {
    Object.keys(this.timeouts).forEach(timeout => clearInterval(this.timeouts[timeout]));
    this.timeouts = {};
  }

  async _fetchPeriodically(url, onFetch, responseHandler, fetchMethod = coFetchJSON) {
    let response;
    try {
      response = await fetchMethod(url);
      if (responseHandler) {
        response = await responseHandler(response);
      }
    } catch (error) {
      response = error;
    } finally {
      onFetch(response);
      this.timeouts[url] = setTimeout(() => fetchPeriodically(url, onFetch, responseHandler, fetchMethod), REFRESH_TIMEOUT);
    }
  }

  _fetchPrometheusQueries(queries) {
    queries.forEach(query => {
      const url = `${getPrometheusBaseURL()}/api/v1/query?query=${encodeURIComponent(query)}`;
      this.fetchPeriodically(url, response => this.props.setPrometheusResult(query, response));
    });
  }

  _fetchAlerts() {
    const url = `${getAlertManagerBaseURL()}/api/v2/alerts?silenced=false&inhibited=false`;
    this.fetchPeriodically(url, this.props.setAlertsResult);
  }

  _fetchUrl(url, responseHandler, fetchMethod) {
    this.fetchPeriodically(`${k8sBasePath}${url}`, response => this.props.setUrlResult(url, response), responseHandler, fetchMethod);
  }

  render() {
    const pages = [
      {
        href: '',
        name: 'Overview',
        component: () => <ClusterOverviewConnected clearTimeouts={this.clearTimeouts} fetchPrometheusQueries={this.fetchPrometheusQueries} fetchAlerts={this.fetchAlerts} fetchUrl={this.fetchUrl} />,
      },
      {
        href: 'storage',
        name: 'Storage',
        component: () => <StorageOverviewConnected clearTimeouts={this.clearTimeouts} fetchPrometheusQueries={this.fetchPrometheusQueries} fetchAlerts={this.fetchAlerts} fetchUrl={this.fetchUrl} />,
      },
    ];
    return (
      <React.Fragment>
        <PageHeading title="Dashboards" detail={true} />
        <HorizontalNav match={this.props.match} pages={pages} noStatusBox />
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  setPrometheusResult: (key, result) => dispatch({type: types.prometheusQuery, key, result}),
  setAlertsResult: result => dispatch({type: types.alerts, result}),
  setUrlResult: (key, result) => dispatch({type: types.url, key, result}),
});

export const DashboardsConnected = connect(null, mapDispatchToProps)(Dashboards);
