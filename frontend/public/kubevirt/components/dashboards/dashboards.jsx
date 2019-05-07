import React from 'react';
import { ClusterOverview } from '../cluster/cluster-overview';
import { HorizontalNav, PageHeading } from '../utils/okdutils';
import { StorageOverview } from '../../../storage/components/storage-overview/storage-overview';
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
    if (onFetch(response)) {
      setTimeout(() => fetchPeriodically(url, onFetch, responseHandler, fetchMethod), REFRESH_TIMEOUT);
    }
  }
};

export const fetchPrometheusQuery = (query, onFetch) => {
  const url = `${getPrometheusBaseURL()}/api/v1/query?query=${encodeURIComponent(query)}`;
  fetchPeriodically(url, onFetch);
};

export const fetchAlerts = onFetch => {
  const url = `${getAlertManagerBaseURL()}/api/v2/alerts?silenced=false&inhibited=false`;
  fetchPeriodically(url, onFetch);
};

const pages = [
  {
    href: '',
    name: 'Overview',
    component: ClusterOverview,
  },
  {
    href: 'storage',
    name: 'Storage',
    component: StorageOverview,
  },
];

export const Dashboards = props => (
  <React.Fragment>
    <PageHeading title="Dashboards" detail={true} />
    <HorizontalNav match={props.match} pages={pages} noStatusBox />
  </React.Fragment>
);
