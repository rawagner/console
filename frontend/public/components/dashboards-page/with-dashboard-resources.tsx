import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Map as ImmutableMap } from 'immutable';

import { RESULTS_TYPE } from '../../reducers/dashboards';
import {
  watchURL,
  stopWatchURL,
  watchPrometheusQuery,
  stopWatchPrometheusQuery,
  Fetch,
  WatchURLAction,
  WatchPrometheusQueryAction,
  StopWatchURLAction,
  StopWatchPrometheusAction,
} from '../../actions/dashboards';
import * as k8sActions from '../../actions/k8s';
import { RootState } from '../../redux';
import { makeQuery, makeReduxID } from '../utils';

const mapDispatchToProps = dispatch => ({
  watchURL: (url, fetch): WatchURL => dispatch(watchURL(url, fetch)),
  stopWatchURL: (url): StopWatchURL => dispatch(stopWatchURL(url)),
  watchPrometheusQuery: (query): WatchPrometheus => dispatch(watchPrometheusQuery(query)),
  stopWatchPrometheusQuery: (query): StopWatchPrometheus => dispatch(stopWatchPrometheusQuery(query)),
  stopK8sWatch: k8sActions.stopK8sWatch,
  watchK8sList: k8sActions.watchK8sList,
  watchK8sObject: k8sActions.watchK8sObject,
});

const mapStateToProps = (state: RootState) => ({
  k8sModels: state.k8s.getIn(['RESOURCES', 'models']),
  k8s: state.k8s,
  [RESULTS_TYPE.URL]: state.dashboards.get(RESULTS_TYPE.URL),
  [RESULTS_TYPE.PROMETHEUS]: state.dashboards.get(RESULTS_TYPE.PROMETHEUS),
});

const WithDashboardResources = (WrappedComponent: React.ComponentType<any>) =>
  class WithDashboardResources_ extends React.Component<WithDashboardResourcesProps> {
    private urls: Array<string> = [];
    private queries: Array<string> = [];
    private k8sIDs: Array<string> = [];

    shouldComponentUpdate(nextProps: WithDashboardResourcesProps) {
      const urlResultChanged = this.urls.some(urlKey =>
        this.props[RESULTS_TYPE.URL].getIn([urlKey, 'result']) !== nextProps[RESULTS_TYPE.URL].getIn([urlKey, 'result'])
      );
      const queryResultChanged = this.queries.some(query =>
        this.props[RESULTS_TYPE.PROMETHEUS].getIn([query, 'result']) !== nextProps[RESULTS_TYPE.PROMETHEUS].getIn([query, 'result'])
      );
      const k8sChanged = this.k8sIDs.some(k8sID =>
        this.props.k8s.getIn(k8sID) !== nextProps.k8s.getIn(k8sID)
      );
      return urlResultChanged || queryResultChanged || k8sChanged;
    }

    watchURL = (url: string, fetch: Fetch) => {
      this.urls.push(url);
      this.props.watchURL(url, fetch);
    }

    watchPrometheus = (query: string) => {
      this.queries.push(query);
      this.props.watchPrometheusQuery(query);
    }

    watchK8sResource = resource => {
      const query = makeQuery(resource.namespace, resource.selector, resource.fieldSelector, resource.name);
      const k8sKind = this.props.k8sModels.get(resource.kind);
      const id = makeReduxID(k8sKind, query);
      this.k8sIDs.push(id);
      resource.isList ? this.props.watchK8sList(id, query, k8sKind) : this.props.watchK8sObject(id, query, k8sKind)
    }

    render() {
      const k8sResources = this.props.k8s.filter((v, k) => this.k8sIDs.some(id => id === k));
      return (
        <WrappedComponent
          watchURL={this.watchURL}
          stopWatchURL={this.props.stopWatchURL}
          watchPrometheus={this.watchPrometheus}
          stopWatchPrometheusQuery={this.props.stopWatchPrometheusQuery}
          urlResults={this.props[RESULTS_TYPE.URL]}
          prometheusResults={this.props[RESULTS_TYPE.URL]}
          watchK8sResource={this.watchK8sResource}
          k8sResources={k8sResources}
        />
      );
    }
  };

export const withDashboardResources = compose(connect(mapStateToProps, mapDispatchToProps), WithDashboardResources);

export type WatchURL = (url: string, fetch?: Fetch) => void;
export type StopWatchURL = (url: string) => void;
export type WatchPrometheus = (query: string) => void;
export type StopWatchPrometheus = (query: string) => void;

type WithDashboardResourcesProps = {
  watchURL: WatchURLAction;
  watchPrometheusQuery: WatchPrometheusQueryAction;
  stopWatchURL: StopWatchURLAction;
  stopWatchPrometheusQuery: StopWatchPrometheusAction;
  [RESULTS_TYPE.PROMETHEUS]: ImmutableMap<string, any>;
  [RESULTS_TYPE.URL]: ImmutableMap<string, any>;
  k8sModels: any,
  watchK8sList: any,
  watchK8sObject: any,
  k8s: any,
};
