import { ActionType as Action, action } from 'typesafe-actions';
import { Dispatch } from 'react-redux';

import { coFetchJSON } from '../co-fetch';
import { k8sBasePath } from '../module/k8s/k8s';
import { RESULTS_TYPE, isWatchActive } from '../reducers/dashboards';
import { RootState } from '../redux';

export enum ActionType {
  StopWatch = 'stopWatch',
  UpdateResult = 'updateResult',
  ActivateWatch = 'activateWatch',
  UpdateWatchTimeout = 'updateWatchTimeout',
  UpdateWatchInFlight = 'updateWatchInFlight',
}

const getPrometheusBaseURL = () => (window as any).SERVER_FLAGS.prometheusBaseURL;

const REFRESH_TIMEOUT = 5000;

export const stopWatch = (type: RESULTS_TYPE, key: string) => action(ActionType.StopWatch, { type, key });
export const updateResult = (type: RESULTS_TYPE, key: string, result) => action(ActionType.UpdateResult, { type, key, result });
export const activateWatch = (type: RESULTS_TYPE, key: string) => action(ActionType.ActivateWatch, { type, key });
export const updateWatchTimeout = (type: RESULTS_TYPE, key: string, timeout) => action(ActionType.UpdateWatchTimeout, { type, key, timeout});
export const updateWatchInFlight = (type: RESULTS_TYPE, key: string, inFlight: boolean) => action(ActionType.UpdateWatchInFlight, { type, key, inFlight });

const dashboardsActions = {
  stopWatch,
  updateResult,
  activateWatch,
  updateWatchTimeout,
  updateWatchInFlight,
};

const fetchPeriodically: FetchPeriodically = async(dispatch, type, key, url, getState, fetchMethod, responseHandler) => {
  if (!isWatchActive(getState().dashboards, type, key)) {
    return;
  }
  let result;
  try {
    dispatch(updateWatchInFlight(type, key, true));
    result = await fetchMethod(url);
    if (responseHandler) {
      result = await responseHandler(result);
    }
  } catch (error) {
    result = error;
  } finally {
    dispatch(updateWatchInFlight(type, key, false));
    dispatch(updateResult(type, key, result));
    const timeout = setTimeout(() => fetchPeriodically(dispatch, type, key, url, getState, fetchMethod, responseHandler), REFRESH_TIMEOUT);
    dispatch(updateWatchTimeout(type, key, timeout));
  }
};

export const watchPrometheusQuery: WatchPrometheusQueryAction = query => (dispatch, getState) => {
  const isActive = isWatchActive(getState().dashboards, RESULTS_TYPE.PROMETHEUS, query);
  dispatch(activateWatch(RESULTS_TYPE.PROMETHEUS, query));
  if (!isActive) {
    const prometheusURL = getPrometheusBaseURL();
    if (!prometheusURL) {
      dispatch(updateResult(RESULTS_TYPE.PROMETHEUS, query, {}));
    } else {
      const url = `${prometheusURL}/api/v1/query?query=${encodeURIComponent(query)}`;
      fetchPeriodically(dispatch, RESULTS_TYPE.PROMETHEUS, query, url, getState, coFetchJSON);
    }
  }
};

export const watchUrl: WatchUrlAction = (url, fetchMethod = coFetchJSON, responseHandler) => (dispatch, getState) => {
  const isActive = isWatchActive(getState().dashboards, RESULTS_TYPE.URL, url);
  dispatch(activateWatch(RESULTS_TYPE.URL, url));
  if (!isActive) {
    const k8sUrl = `${k8sBasePath}/${url}`;
    fetchPeriodically(dispatch, RESULTS_TYPE.URL, url, k8sUrl, getState, fetchMethod, responseHandler);
  }
};

export const stopWatchPrometheusQuery = (query: string) => stopWatch(RESULTS_TYPE.PROMETHEUS, query);
export const stopWatchUrl = (url: string) => stopWatch(RESULTS_TYPE.URL, url);


type ThunkAction = (dispatch: Dispatch, getState: () => RootState) => void;

export type WatchUrlAction = (url: string, fetchMethod?: FetchMethod, responseHandler?: ResponseHandler) => ThunkAction;
export type WatchPrometheusQueryAction = (query: string) => ThunkAction;
export type StopWatchUrlAction = (url: string) => void;
export type StopWatchPrometheusAction = (query: string) => void;

export type FetchMethod = (fetch: string) => Promise<any>;
export type ResponseHandler = (response: any) => Promise<any>;

type FetchPeriodically =
  (dispatch: Dispatch, type: RESULTS_TYPE, key: string, url: string, getState: () => RootState, fetchMethod: FetchMethod, responseHandler?: ResponseHandler) => void;

export type DashboardsAction = Action<typeof dashboardsActions>;
