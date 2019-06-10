import * as React from 'react';
import { connect } from 'react-redux';

import * as plugins from '@console/internal/plugins';
import {
  DashboardCard,
  DashboardCardBody,
} from '@console/internal/components/dashboard/dashboard-card/';
import { HealthBody, HealthItem } from '@console/internal/components/dashboard/health-card';
import { HealthState } from '@console/internal/components/dashboard/health-card/states';
import { featureReducerName, flagPending } from '@console/internal/reducers/features';
import { FLAGS } from '@console/internal/const';
import { withDashboardResources, DashboardItemProps } from '@console/internal/components/dashboards-page/with-dashboard-resources';
import { RootState } from '@console/internal/redux';

import { getCephHealthState } from './utils';

export const getCephHealth = (subsystemStates: SubsystemHealth): CephHealth => {
  let healthState: CephHealth = subsystemStates;
  return healthState;
};

const mapStateToProps = (state: RootState) => ({
  openShiftFlag: state[featureReducerName].get(FLAGS.OPENSHIFT),
});

const _HealthCard: React.FC<HealthProps> = ({
  watchPrometheus,
  stopWatchPrometheusQuery,
  prometheusResults,
  openShiftFlag,
}) => {
  React.useEffect(() => {
    const subsystems = plugins.registry.getDashboardsOverviewHealthSubsystems();

    subsystems.filter(plugins.isDashboardsOverviewHealthPrometheusSubsystem).forEach(subsystem => {
      const { query } = subsystem.properties;
      watchPrometheus(query);
    });
    return () => {
      subsystems.filter(plugins.isDashboardsOverviewHealthPrometheusSubsystem).forEach(subsystem =>
        stopWatchPrometheusQuery(subsystem.properties.query)
      );
    };
  }, [watchPrometheus, stopWatchPrometheusQuery]);

  const cephHealth = prometheusResults.getIn(['ceph_health_status', 'result']);
  const cephHealthState = getCephHealthState(cephHealth);

  const healthState = getCephHealth(cephHealthState);

  return (
    <DashboardCard>
      <DashboardCardBody isLoading={flagPending(openShiftFlag)}>
        <HealthBody>
          <HealthItem
            state={healthState.state}
            message={healthState.message}
            details={healthState.details}
          />
        </HealthBody>
      </DashboardCardBody>
    </DashboardCard>
  );
};

export const HealthCard = withDashboardResources(connect(mapStateToProps)(_HealthCard));

type CephHealth = {
  state: HealthState;
  message?: string;
  details?: string,
};

export type SubsystemHealth = {
  message?: string;
  state: HealthState;
};

type HealthProps = DashboardItemProps & {
  openShiftFlag: boolean;
};
