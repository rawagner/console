import { applyMiddleware, combineReducers, createStore, compose, Reducer } from 'redux';
import * as _ from 'lodash-es';

import {
  featureReducer,
  featureReducerName,
  FeatureState,
  stateToFlagsObject,
} from './reducers/features';
import { monitoringReducer, monitoringReducerName, MonitoringState } from './reducers/monitoring';
import k8sReducers, { K8sState } from './reducers/k8s';
import UIReducers, { UIState } from './reducers/ui';
import { dashboardsReducer, DashboardsState } from './reducers/dashboards';
import { registry } from './plugins';

const composeEnhancers =
  // eslint-disable-next-line no-undef
  (process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

/**
 * This is the entirety of the `redux-thunk` library.
 * It hasn't changed since 2016 and has problems with it's TypeScript definitions (https://github.com/reduxjs/redux-thunk/issues/231), so just including it here.
 */
function createThunkMiddleware(extraArgument?) {
  return ({ dispatch, getState }) => (next) => (action) => {
    if (typeof action === 'function') {
      return action(dispatch, getState, extraArgument);
    }

    return next(action);
  };
}

const thunk = createThunkMiddleware();
(thunk as any).withExtraArgument = createThunkMiddleware;

export type RootState = {
  k8s: K8sState;
  UI: UIState;
  [featureReducerName]: FeatureState;
  [monitoringReducerName]: MonitoringState;
  dashboards: DashboardsState;
  plugins?: {
    [namespace: string]: Reducer;
  };
};

const reducers = {
  k8s: k8sReducers, // data
  UI: UIReducers,
  [featureReducerName]: featureReducer,
  [monitoringReducerName]: monitoringReducer,
  dashboards: dashboardsReducer,
};

const store = createStore(
  combineReducers<RootState>(reducers),
  {},
  composeEnhancers(applyMiddleware(thunk)),
);

(() => {
  const pluginReducerFlags = registry.getFlagsForExtensions(registry.getPluginReducers());
  let currentFlags = _.pick(stateToFlagsObject(store.getState()), pluginReducerFlags);
  store.subscribe(() => {
    const flags = _.pick(stateToFlagsObject(store.getState()), pluginReducerFlags);
    if (JSON.stringify(currentFlags) !== JSON.stringify(flags)) {
      currentFlags = flags;
      const pluginReducers = registry
        .getPluginReducers()
        .filter((e) => registry.isExtensionInUse(e, currentFlags));
      const pluginReducerState = pluginReducers.reduce(
        (acc, e) => {
          acc[e.properties.namespace] = e.properties.reducer;
          return acc;
        },
        {} as RootState['plugins'],
      );
      if (_.isEmpty(pluginReducerState)) {
        store.replaceReducer(combineReducers<RootState>(reducers));
      } else {
        store.replaceReducer(
          combineReducers<RootState>({
            plugins: combineReducers(pluginReducerState),
            ...reducers,
          }),
        );
      }
    }
  });
})();

// eslint-disable-next-line no-undef
if (process.env.NODE_ENV !== 'production') {
  // Expose Redux store for debugging
  (window as any).store = store;
}

export default store;
