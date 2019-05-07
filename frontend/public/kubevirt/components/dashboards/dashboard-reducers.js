import { types } from './dashboard-actions';

export const dashboardReducerName = 'DASHBOARD';

export const dashboardReducer = (state, action) => {
  if (!state) {
    state = {};
  }
  switch (action.type) {
    case types.prometheusQuery:
      return {
        ...state,
        PROMETHEUS_RESULTS: {
          ...state.PROMETHEUS_RESULTS,
          [action.key]: action.result,
        },
      };
    case types.alerts:
      return {
        ...state,
        ALERTS_RESULTS: action.result,
      };
    case types.url:
      return {
        ...state,
        URL_RESULTS: action.result,
      };
    default:
      return state;
  }
};
