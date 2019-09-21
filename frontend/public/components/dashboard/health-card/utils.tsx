import * as _ from 'lodash-es';
import { Alert, getRuleID, PrometheusRulesResponse } from '../../monitoring';

export const getAlertSeverity = (alert: Alert): string => _.get(alert, 'labels.severity');
export const getAlertMessage = (alert: Alert): string => _.get(alert, 'annotations.message');
export const getAlertDescription = (alert: Alert): string => _.get(alert, 'annotations.description');
export const getAlertTime = (alert: Alert): string => _.get(alert, 'activeAt');

export const getAlerts = (alertsResults: PrometheusRulesResponse): Alert[] =>
  alertsResults
    ? getRuleID(alertsResults.data)
      .filter(a => a.state === 'firing' && _.get(a, 'labels.alertname') !== 'Watchdog')
      .sort((a, b) => +new Date(getAlertTime(b)) - +new Date(getAlertTime(a)))
    : [];
