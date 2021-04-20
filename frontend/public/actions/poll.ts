import { RootState } from '../redux';
import { action, ActionType as Action } from 'typesafe-actions';
import { Dispatch } from 'react-redux';
import { PollState } from '../reducers/poll';
import { coFetchJSON } from '../co-fetch';

export enum ActionType {
  StopWatch = 'stopWatch',
  SetData = 'setData',
  StartWatch = 'startWatch',
  UpdateWatchTimeout = 'updateWatchTimeout',
  UpdateWatchInFlight = 'updateWatchInFlight',
  SetError = 'setError',
}

export const stopPollURL = (url: string, delay: number) =>
  action(ActionType.StopWatch, { url, delay });
const setData = (url: string, data) => action(ActionType.SetData, { url, data });
const startWatch = (url: string, delay: number) => action(ActionType.StartWatch, { url, delay });
const updateWatchTimeout = (url: string, timeout: NodeJS.Timer) =>
  action(ActionType.UpdateWatchTimeout, { url, timeout });
const updateWatchInFlight = (url: string, inFlight: boolean) =>
  action(ActionType.UpdateWatchInFlight, { url, inFlight });
const setError = (url: string, error) => action(ActionType.SetError, { url, error });

const pollActions = {
  stopPollURL,
  setData,
  startWatch,
  updateWatchTimeout,
  updateWatchInFlight,
  setError,
};

export type PollAction = Action<typeof pollActions>;

const isWatchActive = (state: PollState, url: string): boolean => {
  return state.getIn([url, 'active']) > 0 || state.getIn([url, 'inFlight']);
};

type FetchPeriodically = (
  dispatch: Dispatch,
  url: string,
  delay: number,
  getState: () => RootState,
) => void;

const fetchPeriodically: FetchPeriodically = async (dispatch, url, delay, getState) => {
  if (!isWatchActive(getState().poll, url)) {
    return;
  }
  try {
    dispatch(updateWatchInFlight(url, true));
    const data = await coFetchJSON(url);
    dispatch(setData(url, data));
  } catch (error) {
    dispatch(setError(url, error));
  } finally {
    dispatch(updateWatchInFlight(url, false));
    const timeout = setTimeout(
      () => fetchPeriodically(dispatch, url, delay, getState),
      Math.min(getState().poll.getIn([url, 'delays'])), // TODO update as soon as delay changes
    );
    dispatch(updateWatchTimeout(url, timeout));
  }
};

export const pollURL = (url: string, delay: number) => (dispatch, getState) => {
  const isActive = isWatchActive(getState().poll, url);
  dispatch(startWatch(url, delay));
  if (!isActive) {
    fetchPeriodically(dispatch, url, delay, getState);
  } else if (getState().getIn([url, 'active']) > 0) {
    // TODO update as soon as delay changes here
  }
};
