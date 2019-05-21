import { ActionType, DashboardsAction } from '../actions/dashboards';
import { Map as ImmutableMap, fromJS } from 'immutable';

export enum RESULTS_TYPE {
  PROMETHEUS = 'PROMETHEUS',
  URL = 'URL',
}

export type DashboardsState = ImmutableMap<string, any>;

export const isWatchActive = (state: DashboardsState, type: string, key: string): boolean => state.getIn([type, key, 'active']) > 0 || state.getIn([type, key, 'inFlight']);

export const dashboardsReducer = (state: DashboardsState, action: DashboardsAction): DashboardsState => {
  if (!state) {
    state = ImmutableMap({
      [RESULTS_TYPE.PROMETHEUS]: fromJS({}),
      [RESULTS_TYPE.URL]: fromJS({}),
    });
  }
  switch (action.type) {
    case ActionType.ActivateWatch: {
      const activePath = [action.payload.type, action.payload.key, 'active'];
      const active = state.hasIn(activePath) ? state.getIn(activePath) : 0;
      return state.setIn(activePath, active + 1);
    }
    case ActionType.UpdateWatchTimeout:
      return state.setIn([action.payload.type, action.payload.key, 'timeout'], action.payload.timeout);
    case ActionType.UpdateWatchInFlight:
      return state.setIn([action.payload.type, action.payload.key, 'inFlight'], action.payload.inFlight);
    case ActionType.StopWatch: {
      const active = state.getIn([action.payload.type, action.payload.key, 'active']);
      const newState = state.setIn([action.payload.type, action.payload.key, 'active'], active - 1);
      if (active === 1) {
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
