import { Extension } from '.';
import { HealthState } from '@console/internal/components/dashboards-page/overview-dashboard/health-card';

namespace ExtensionProperties {
  interface OverviewHealthSubsystem<R> {
    title: string;
    healthHandler: (response: R) => HealthState;
  }

  export interface OverviewHealthURLSubsystem<R> extends OverviewHealthSubsystem<R>{
    url: string;
    fetch?: (url: string) => Promise<R>;
  }

  export interface OverviewHealthPrometheusSubsystem extends OverviewHealthSubsystem<any>{
    query: string;
  }
}

export interface OverviewHealthURLSubsystem<R> extends Extension<ExtensionProperties.OverviewHealthURLSubsystem<R>> {
  type: 'Dashboards/Overview/Health/URL';
}

export const isOverviewHealthURLSubsystem = (e: Extension<any>): e is OverviewHealthURLSubsystem<any> =>
  e.type === 'Dashboards/Overview/Health/URL';

export interface OverviewHealthPrometheusSubsystem extends Extension<ExtensionProperties.OverviewHealthPrometheusSubsystem> {
  type: 'Dashboards/Overview/Health/Prometheus';
}

export const isOverviewHealthPrometheusSubsystem = (e: Extension<any>): e is OverviewHealthPrometheusSubsystem =>
  e.type === 'Dashboards/Overview/Health/Prometheus';

export type OverviewHealthSubsystem = OverviewHealthURLSubsystem<any> | OverviewHealthPrometheusSubsystem;

export const isOverviewHealthSubsystem = (e: Extension<any>): e is OverviewHealthSubsystem =>
  isOverviewHealthURLSubsystem(e) || isOverviewHealthPrometheusSubsystem(e);
