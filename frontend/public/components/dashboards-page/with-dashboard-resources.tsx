import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Map as ImmutableMap } from 'immutable';

import { RESULTS_TYPE } from '../../reducers/dashboards';
import {
  watchUrl,
  stopWatchUrl,
  watchPrometheusQuery,
  stopWatchPrometheusQuery,
  FetchMethod,
  ResponseHandler,
  WatchUrlAction,
  WatchPrometheusQueryAction,
  StopWatchUrlAction,
  StopWatchPrometheusAction,
} from '../../actions/dashboards';
import { RootState } from '../../redux';

const mapDispatchToProps = dispatch => ({
  watchUrl: (url, fetchMethod, responseHandler): WatchUrl => dispatch(watchUrl(url, fetchMethod, responseHandler)),
  stopWatchUrl: (url): StopWatchUrl => dispatch(stopWatchUrl(url)),
  watchPrometheusQuery: (query): WatchPrometheus => dispatch(watchPrometheusQuery(query)),
  stopWatchPrometheusQuery: (query): StopWatchPrometheus => dispatch(stopWatchPrometheusQuery(query)),
});

const mapStateToProps = (state: RootState) => ({
  [RESULTS_TYPE.URL]: state.dashboards.get(RESULTS_TYPE.URL),
  [RESULTS_TYPE.PROMETHEUS]: state.dashboards.get(RESULTS_TYPE.PROMETHEUS),
});

const WithDashboardResources = (WrappedComponent: React.ComponentType<any>) =>
  class _WithDashboardResources extends React.Component<WithDashboardResourcesProps> {
    private urls: Array<string> = [];
    private queries: Array<string> = [];
    private _watchUrl = this.watchUrl.bind(this);
    private _watchPrometheus = this.watchUrl.bind(this);

    shouldComponentUpdate(nextProps: WithDashboardResourcesProps) {
      const urlResultChanged = this.urls.some(urlKey =>
        this.props[RESULTS_TYPE.URL].getIn([urlKey, 'result']) !== nextProps[RESULTS_TYPE.URL].getIn([urlKey, 'result'])
      );
      const queryResultChanged = this.queries.some(query =>
        this.props[RESULTS_TYPE.PROMETHEUS].getIn([query, 'result']) !== nextProps[RESULTS_TYPE.PROMETHEUS].getIn([query, 'result'])
      );
      return urlResultChanged || queryResultChanged;
    }

    componentWillUnmount() {
      this.urls.forEach(this.props.stopWatchUrl);
      this.queries.forEach(this.props.stopWatchPrometheusQuery);
    }

    watchUrl(url: string, fetchMethod: FetchMethod, responseHandler: ResponseHandler) {
      this.urls.push(url);
      this.props.watchUrl(url, fetchMethod, responseHandler);
    }

    watchPrometheus(query: string) {
      this.queries.push(query);
      this.props.watchPrometheusQuery(query);
    }

    render() {
      return (
        <WrappedComponent
          watchUrl={this._watchUrl}
          watchPrometheus={this._watchPrometheus}
          urlResults={this.props[RESULTS_TYPE.URL]}
          prometheusResults={this.props[RESULTS_TYPE.URL]}
        />
      );
    }
  };

export const withDashboardResources = compose(connect(mapStateToProps, mapDispatchToProps), WithDashboardResources);

export type WatchUrl = (url: string, fetchMethod?: FetchMethod, responseHandler?: ResponseHandler) => void;
export type StopWatchUrl = (url: string) => void;
export type WatchPrometheus = (query: string) => void;
export type StopWatchPrometheus = (query: string) => void;

type WithDashboardResourcesProps = {
  watchUrl: WatchUrlAction,
  watchPrometheusQuery: WatchPrometheusQueryAction,
  stopWatchUrl: StopWatchUrlAction,
  stopWatchPrometheusQuery: StopWatchPrometheusAction,
  [RESULTS_TYPE.PROMETHEUS]: ImmutableMap<string, any>,
  [RESULTS_TYPE.URL]: ImmutableMap<string, any>,
};
