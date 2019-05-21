import { Extension } from '.';
import { GetHealthStateFunction } from '@console/internal/components/dashboards-page/overview-dashboard/health-card';

namespace ExtensionProperties {
  export interface OverviewHealthURLSubsystem {
    title: string;
    url: string;
    responseHandler?: any;
    fetchMethod?: any;
    healthHandler: GetHealthStateFunction;
  }
  
  export interface OverviewHealthPrometheusSubsystem {
    title: string;
    query: string;
    healthHandler: GetHealthStateFunction;
  }
}

export interface OverviewHealthURLSubsystem extends Extension<ExtensionProperties.OverviewHealthURLSubsystem> {
  type: 'Dashboards/Overview/HealthURLSubsystem';
}

export const isOverviewHealthURLSubsystem = (e: Extension<any>): e is OverviewHealthURLSubsystem =>
  e.type === 'Dashboards/Overview/HealthURLSubsystem';

export interface OverviewHealthPrometheusSubsystem extends Extension<ExtensionProperties.OverviewHealthPrometheusSubsystem> {
  type: 'Dashboards/Overview/HealthPrometheusSubsystem';
}

export const isOverviewHealthPrometheusSubsystem = (e: Extension<any>): e is OverviewHealthPrometheusSubsystem =>
  e.type === 'Dashboards/Overview/HealthPrometheusSubsystem';

export type OverviewHealthSubsystem = OverviewHealthURLSubsystem | OverviewHealthPrometheusSubsystem;

export const isOverviewHealthSubsystem = (e: Extension<any>): e is OverviewHealthPrometheusSubsystem =>
  isOverviewHealthURLSubsystem(e) || isOverviewHealthPrometheusSubsystem(e);

