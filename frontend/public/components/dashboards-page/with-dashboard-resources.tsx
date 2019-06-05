import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Map as ImmutableMap } from 'immutable';
import * as _ from 'lodash-es';

import * as k8sActions from '../../actions/k8s';
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
import { RootState } from '../../redux';
import { makeReduxID, makeQuery } from '../utils';

const mapDispatchToProps = dispatch => ({
  watchURL: (url, fetch): WatchURL => dispatch(watchURL(url, fetch)),
  stopWatchURL: (url): StopWatchURL => dispatch(stopWatchURL(url)),
  watchPrometheusQuery: (query): WatchPrometheus => dispatch(watchPrometheusQuery(query)),
  stopWatchPrometheusQuery: (query): StopWatchPrometheus => dispatch(stopWatchPrometheusQuery(query)),
  stopK8sWatch: id => dispatch(k8sActions.stopK8sWatch(id, false, 'dashboard')),
  watchK8sObject: (id, name, namespace, query, k8sKind) => dispatch(k8sActions.watchK8sObject(id, name, namespace, query, k8sKind, 'dashboard')),
  watchK8sList: (id, query, k8sKind) => dispatch(k8sActions.watchK8sList(id, query, k8sKind)),
});

const mapStateToProps = (state: RootState) => ({
  [RESULTS_TYPE.URL]: state.dashboards.get(RESULTS_TYPE.URL),
  [RESULTS_TYPE.PROMETHEUS]: state.dashboards.get(RESULTS_TYPE.PROMETHEUS),
  k8sModels: state.k8s.getIn(['RESOURCES', 'models']),
  inFlight: state.k8s.getIn(['RESOURCES', 'inFlight']),
  k8s: state.k8s,
});

const WithDashboardResources = (WrappedComponent: React.ComponentType<any>) =>
  class WithDashboardResources_ extends React.Component<WithDashboardResourcesProps> {
    private urls: Array<string> = [];
    private queries: Array<string> = [];
    private k8sIDs: Array<object> = [];

    constructor(props) {
      super(props);
      this.state = {
        k8sResources: [],
      };
    }

    shouldComponentUpdate(nextProps: WithDashboardResourcesProps) {
      const urlResultChanged = this.urls.some(urlKey =>
        this.props[RESULTS_TYPE.URL].getIn([urlKey, 'result']) !== nextProps[RESULTS_TYPE.URL].getIn([urlKey, 'result'])
      );
      const queryResultChanged = this.queries.some(query =>
        this.props[RESULTS_TYPE.PROMETHEUS].getIn([query, 'result']) !== nextProps[RESULTS_TYPE.PROMETHEUS].getIn([query, 'result'])
      );
      const modelsUpdated = this.props.k8sModels !== nextProps.k8sModels;
      const { k8s } = this.props;
      const k8sChanged = this.k8sIDs.some(k8sId => {
        const thisData = k8s.getIn([k8sId.id, 'data']);
        const nextData = nextProps.k8s.getIn([k8sId.id, 'data']);
        return thisData === nextData;
      });
      return urlResultChanged || queryResultChanged || modelsUpdated || !nextProps.inFlight || k8sChanged;
    }

    componentDidUpdate(prevProps) {
      if (!this.props.inFlight && prevProps.inFlight) {
        this.startWatching(this.k8sIDs);
      }
    }

    startWatching = k8sIDs => {
      this.state.k8sResources.forEach(resource => {
        const query = makeQuery(resource.namespace, resource.selector, resource.fieldSelector, resource.name);
        const k8sKind = this.props.k8sModels.get(resource.kind);
        if (!k8sKind) {
          return;
        }
        const id = makeReduxID(k8sKind, query);
        k8sIDs.push({resource, id});
        resource.isList ? this.props.watchK8sList(id, query, k8sKind) : this.props.watchK8sObject(id, resource.name, resource.namespace, query, k8sKind);
      });
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
      this.setState(state => ({
        k8sResources: [...state.k8sResources, resource],
      }));
    }

    stopWatchK8sResource = resource => {
      const k8sResource = this.k8sIDs.find(r => _.isEqual(r.resource, resource));
      if (k8sResource) {
        const k8sResources = this.state.k8sResources.filter(r => !_.isEqual(resource, r));
        this.setState({
          k8sResources,
        });
        this.props.stopK8sWatch(k8sResource.id);
      }
    }

    render() {
      const { k8s } = this.props;
      const finalMap = {};
      this.k8sIDs.forEach(k8sID => {
        const abc = k8s.getIn([k8sID.id, 'data']);
        if(_.isEqual(abc, {})) {
          finalMap[k8sID.resource.prop] = ImmutableMap();
        } else {
          finalMap[k8sID.resource.prop] = abc;
        }
      })
      return (
        <WrappedComponent
          watchURL={this.watchURL}
          stopWatchURL={this.props.stopWatchURL}
          watchPrometheus={this.watchPrometheus}
          stopWatchPrometheusQuery={this.props.stopWatchPrometheusQuery}
          urlResults={this.props[RESULTS_TYPE.URL]}
          prometheusResults={this.props[RESULTS_TYPE.URL]}
          watchK8sResource={this.watchK8sResource}
          stopWatchK8sResource={this.stopWatchK8sResource}
          k8sResources={finalMap}
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
  stopK8sWatch: any;
  watchK8sObject: any;
  watchK8sList: any;
  k8sModels: any;
  k8s: any;
  inFlight: any;
};
