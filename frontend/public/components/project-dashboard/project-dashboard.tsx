import * as React from 'react';

import { Dashboard, DashboardGrid } from '../dashboard';
import { K8sResourceKind } from '../../module/k8s';
import { DetailsCard } from './details-card';
import { StatusCard } from './status-card';
import { UtilizationCard } from './utilization-card';
import { getName } from '@console/shared';
import { InventoryCard } from './inventory-card';
import { ActivityCard } from './activity-card';

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ obj }) => {
  const projectName = getName(obj);

  const ProjectUtilizationCard = React.useCallback(
    () => <UtilizationCard projectName={projectName} />,
    [projectName],
  );

  const ProjectInventoryCard = React.useCallback(
    () => <InventoryCard projectName={projectName} />,
    [projectName],
  );

  const ProjectActivityCard = React.useCallback(() => <ActivityCard projectName={projectName} />, [
    projectName,
  ]);

  const mainCards = [{ Card: () => <StatusCard obj={obj} /> }, { Card: ProjectUtilizationCard }];
  const leftCards = [{ Card: () => <DetailsCard obj={obj} /> }, { Card: ProjectInventoryCard }];
  const rightCards = [{ Card: ProjectActivityCard }];

  return (
    <Dashboard>
      <DashboardGrid mainCards={mainCards} leftCards={leftCards} rightCards={rightCards} />
    </Dashboard>
  );
};

type ProjectDashboardProps = {
  obj: K8sResourceKind;
};
