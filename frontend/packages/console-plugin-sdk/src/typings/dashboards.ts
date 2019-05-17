import { Extension } from '.';
import { GetHealthStateFunction } from '@console/internal/components/dashboards-page/overview-dashboard/health-card';

export interface OverviewHealthUrlSubsystemProperties {
  title: string,
  url: string,
  responseHandler?: any,
  fetchMethod?: any,
  healthHandler: GetHealthStateFunction,
}

export interface OverviewHealthPrometheusSubsystemProperties {
  title: string,
  query: string,
  healthHandler: GetHealthStateFunction,
}

export interface OverviewHealthUrlSubsystem extends Extension<OverviewHealthUrlSubsystemProperties> {
  type: 'Dashboards/Overview/HealthUrlSubsystem';
}

export function isOverviewHealthUrlSubsystem(e: Extension<any>): e is OverviewHealthUrlSubsystem {
  return e.type === 'Dashboards/Overview/HealthUrlSubsystem';
}

export interface OverviewHealthPrometheusSubsystem extends Extension<OverviewHealthPrometheusSubsystemProperties> {
  type: 'Dashboards/Overview/HealthPrometheusSubsystem';
}

export function isOverviewHealthPrometheusSubsystem(e: Extension<any>): e is OverviewHealthPrometheusSubsystem {
  return e.type === 'Dashboards/Overview/HealthPrometheusSubsystem';
}

export type OverviewHealthSubsystem = OverviewHealthUrlSubsystem | OverviewHealthPrometheusSubsystem;

export function isOverviewHealthSubsystem(e: Extension<any>): e is OverviewHealthPrometheusSubsystem {
  return isOverviewHealthUrlSubsystem(e) || isOverviewHealthPrometheusSubsystem(e);
}

