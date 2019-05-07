export const types = {
  prometheusQuery: 'prometheusQuery',
  alerts: 'alerts',
  url: 'url',
};

export const actions = {
  setPrometheusResult: (key, result) => dispatch => dispatch({type: types.prometheusQuery, key, result}),
};
