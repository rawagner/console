import { ActionType as Action, action } from 'typesafe-actions';
import { Dispatch } from 'react-redux';

import { coFetchJSON } from '../co-fetch';
import { k8sBasePath } from '../module/k8s';
import { PROMETHEUS_RESULTS, URL_RESULTS, isWatchActive } from '../reducers/dashboards';

export enum ActionType {
  StopWatch = 'stopWatch',
  UpdateResult = 'updateResult',
  ActivateWatch = 'activateWatch',
  UpdateWatchTimeout = 'updateWatchTimeout',
  UpdateWatchInFlight = 'updateWatchInFlight',
};

const getPrometheusBaseURL = () => (window as any).SERVER_FLAGS.prometheusBaseURL;

const REFRESH_TIMEOUT = 5000;

const fetchPrometheusQueryPeriodically = async(dispatch: Dispatch, query: string, getState) => {
  if(!isWatchActive(getState().dashboards, PROMETHEUS_RESULTS, query)) {
    return;
  }
  const url = `${getPrometheusBaseURL()}/api/v1/query?query=${encodeURIComponent(query)}`;
  let result;
  try {
    dispatch(updateWatchInFlight(PROMETHEUS_RESULTS, query, true));
    result = await coFetchJSON(url);
  } catch (error) {
    result = error;
  } finally {
    dispatch(updateWatchInFlight(PROMETHEUS_RESULTS, query, false));
    dispatch(updateResult(PROMETHEUS_RESULTS, query, result));
    const timeout = setTimeout(() => fetchPrometheusQueryPeriodically(dispatch, query, getState), REFRESH_TIMEOUT);
    dispatch(updateWatchTimeout(PROMETHEUS_RESULTS, query, timeout));
  }
};

const fetchUrlPeriodically = async(dispatch: Dispatch, url: string, fetchMethod: fetchMethod = coFetchJSON, getState, responseHandler?: responseHandler) => {
  if(!isWatchActive(getState().dashboards, URL_RESULTS, url)) {
    return;
  }
  const k8sUrl = `${k8sBasePath}/${url}`;
  let result;
  try {
    dispatch(updateWatchInFlight(URL_RESULTS, url, true));
    result = await fetchMethod(k8sUrl);
    if (responseHandler) {
      result = await responseHandler(result);
    }
  } catch (error) {
    result = error;
  } finally {
    dispatch(updateWatchInFlight(URL_RESULTS, url, false));
    dispatch(updateResult(URL_RESULTS, url, result));
    const timeout = setTimeout(() => fetchUrlPeriodically(dispatch, url, fetchMethod, getState, responseHandler), REFRESH_TIMEOUT);
    dispatch(updateWatchTimeout(URL_RESULTS, url, timeout));
  }
};

export const watchPrometheusQuery = (query: string) => (dispatch: Dispatch, getState) => {
  const isActive = isWatchActive(getState().dashboards, PROMETHEUS_RESULTS, query);
  dispatch(activateWatch(PROMETHEUS_RESULTS, query));
  if (!isActive) {
    fetchPrometheusQueryPeriodically(dispatch, query, getState);
  }
};

export const watchUrl = (url: string, fetchMethod: fetchMethod, responseHandler: responseHandler) => (dispatch: Dispatch, getState) => {
  const isActive = isWatchActive(getState().dashboards, URL_RESULTS, url);
  dispatch(activateWatch(URL_RESULTS, url));
  if (!isActive) {
    fetchUrlPeriodically(dispatch, url, fetchMethod, getState, responseHandler);
  }
};

export const stopWatchPrometheusQuery = (query: string) => stopWatch(PROMETHEUS_RESULTS, query);
export const stopWatchUrl = (url: string) => stopWatch(URL_RESULTS, url);

export const stopWatch = (type: string, key: string) => action(ActionType.StopWatch, { type, key });
export const updateResult = (type: string, key: string, result: any) => action(ActionType.UpdateResult, { type, key, result });
export const activateWatch = (type: string, key: string) => action(ActionType.ActivateWatch, { type, key });
export const updateWatchTimeout = (type: string, key: string, timeout: any) => action(ActionType.UpdateWatchTimeout, { type, key, timeout});
export const updateWatchInFlight = (type: string, key: string, inFlight: boolean) => action(ActionType.UpdateWatchInFlight, { type, key, inFlight });

const dashboardsActions = {
  stopWatch,
  updateResult,
  activateWatch,
  updateWatchTimeout,
  updateWatchInFlight,
};

type fetchMethod = (fetch: string) => Promise<any>;
type responseHandler = (response: any) => Promise<any>;

export type DashboardsAction = Action<typeof dashboardsActions>;
