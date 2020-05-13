import * as React from 'react';
import * as _ from 'lodash';
import { K8sResourceKind, PodKind } from '@console/internal/module/k8s/types';
import { podPhase } from '@console/internal/module/k8s/pods';
import { PodsOverview } from '@console/internal/components/overview/pods-overview';
import ConfigurationsOverviewList from './ConfigurationsOverviewList';
import KSRoutesOverviewList from './RoutesOverviewList';
import DeploymentOverviewList from './DeploymentOverviewList';
import { PodControllerOverviewItem } from '@console/shared/src/types/pod';

const AUTOSCALED = 'Autoscaled to 0';
type KnativeRevisionResourceProps = {
  ksroutes: K8sResourceKind[];
  configurations: K8sResourceKind[];
  obj: K8sResourceKind;
  pods?: PodKind[];
  current?: PodControllerOverviewItem;
};

const KnativeRevisionResources: React.FC<KnativeRevisionResourceProps> = ({
  ksroutes,
  configurations,
  obj,
  pods,
  current,
}) => {
  const {
    kind: resKind,
    metadata: { name, namespace },
  } = obj;
  const activePods = _.filter(pods, (pod) => podPhase(pod) !== AUTOSCALED);
  const linkUrl = `/search/ns/${namespace}?kind=Pod&q=${encodeURIComponent(
    `serving.knative.dev/${resKind.toLowerCase()}=${name}`,
  )}`;
  return (
    <>
      <PodsOverview pods={activePods} obj={obj} emptyText={AUTOSCALED} allPodsLink={linkUrl} />
      <DeploymentOverviewList current={current} />
      <KSRoutesOverviewList ksroutes={ksroutes} resource={obj} />
      <ConfigurationsOverviewList configurations={configurations} />
    </>
  );
};

export default KnativeRevisionResources;
