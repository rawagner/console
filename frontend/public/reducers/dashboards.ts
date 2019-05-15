import { ActionType, DashboardsAction } from '../actions/dashboards';
import { Map as ImmutableMap, fromJS } from 'immutable';

export const PROMETHEUS_RESULTS = 'PROMETHEUS_RESULTS';
export const URL_RESULTS = 'URL_RESULTS';

export type DashboardsState = ImmutableMap<string, any>;

export const isWatchActive = (state: DashboardsState, type: string, key: string): boolean => state.getIn([type, key, 'active']) > 0 || state.getIn([type, key, 'inFlight']);

export const dashboardsReducer = (state: DashboardsState, action: DashboardsAction): DashboardsState => {
  if (!state) {
    state = ImmutableMap({
      PROMETHEUS_RESULTS: fromJS({}),
      URL_RESULTS: fromJS({}),
    });
  }
  switch (action.type) {
    case ActionType.ActivateWatch: {
      const activePath = [action.payload.type, action.payload.key, 'active'];
      let active;
      if (state.hasIn(activePath)) {
        active = state.getIn(activePath)
      } else {
        active = 0;
      }
      return state.setIn(activePath, active+1);
    }
    case ActionType.UpdateWatchTimeout:
      return state.setIn([action.payload.type, action.payload.key, 'timeout'], action.payload.timeout);
    case ActionType.UpdateWatchInFlight:
      return state.setIn([action.payload.type, action.payload.key, 'inFlight'], action.payload.inFlight);
    case ActionType.StopWatch: {
      const active = state.getIn([action.payload.type, action.payload.key, 'active']);
      let newState = state.setIn([action.payload.type, action.payload.key, 'active'], active-1);
      if (active -1 === 0) {
        clearTimeout(state.getIn([action.payload.type, action.payload.key, 'timeout']));
      }
      return newState;
    }
    case ActionType.UpdateResult:
      return state.setIn([action.payload.type, action.payload.key, 'result'], action.payload.result);
    default:
      return state;
  }
};
