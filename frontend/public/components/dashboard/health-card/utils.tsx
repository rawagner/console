import * as _ from 'lodash-es';
import { Map as ImmutableMap } from 'immutable';
import { Alert, PrometheusRulesResponse } from '../../monitoring';
import { ALERTS_KEY } from '../../../actions/dashboards';
import { Request } from '../../../reducers/dashboards';

export const getAlertSeverity = (alert: Alert): string => _.get(alert, 'labels.severity');
export const getAlertMessage = (alert: Alert): string => _.get(alert, 'annotations.message');
export const getAlertDescription = (alert: Alert): string => _.get(alert, 'annotations.description');

export const filterAlerts = (alerts: Alert[]): Alert[] =>
  alerts.filter(alert => _.get(alert, 'labels.alertname') !== 'Watchdog');

export const getAlerts = (alertsResults: ImmutableMap<string, Request<PrometheusRulesResponse>>): Alert[] => {
  const alertsResponse = alertsResults ? alertsResults.getIn([ALERTS_KEY, 'data'], []) : [];
  return Array.isArray(alertsResponse) ? filterAlerts(alertsResponse) : [];
};
