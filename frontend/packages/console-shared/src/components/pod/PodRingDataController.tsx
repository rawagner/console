import * as React from 'react';
import { Firehose } from '@console/internal/components/utils/firehose';
import { FirehoseResource } from '@console/internal/components/utils/types';
import {
  DaemonSetModel,
  PodModel,
  ReplicaSetModel,
  ReplicationControllerModel,
  DeploymentModel,
  DeploymentConfigModel,
  StatefulSetModel,
} from '@console/internal/models';
import { PodRingData, PodRingResources } from '../../types/pod';
import { transformPodRingData, podRingFirehoseProps } from '../../utils/pod-ring-utils';

interface RenderPropsType {
  loaded: boolean;
  loadError: any;
  data: PodRingData;
}

interface ControllerProps {
  loaded?: boolean;
  loadError?: any;
  resources?: PodRingResources;
  kind: string;
  render(RenderProps: RenderPropsType): React.ReactElement;
}

interface PodRingDataControllerProps {
  namespace: string;
  kind: string;
  render(RenderProps: RenderPropsType): React.ReactElement;
}

const Controller: React.FC<ControllerProps> = React.memo(
  ({ resources, render, loaded, loadError, kind }) => {
    return render({
      loaded,
      loadError,
      data: loaded ? transformPodRingData(resources, kind) : null,
    });
  },
);

const PodRingController: React.FC<PodRingDataControllerProps> = ({ namespace, kind, render }) => {
  const resources: FirehoseResource[] = [
    {
      isList: true,
      kind: PodModel.kind,
      namespace,
      prop: podRingFirehoseProps[PodModel.kind],
    },
    {
      isList: true,
      kind: ReplicaSetModel.kind,
      namespace,
      prop: podRingFirehoseProps[ReplicaSetModel.kind],
    },
    {
      isList: true,
      kind: ReplicationControllerModel.kind,
      namespace,
      prop: podRingFirehoseProps[ReplicationControllerModel.kind],
    },
  ];

  switch (kind) {
    case DeploymentModel.kind:
      resources.push({
        isList: true,
        kind,
        namespace,
        prop: podRingFirehoseProps[kind],
      });
      break;
    case DeploymentConfigModel.kind:
      resources.push({
        isList: true,
        kind,
        namespace,
        prop: podRingFirehoseProps[kind],
      });
      break;
    case StatefulSetModel.kind:
      resources.push({
        isList: true,
        kind,
        namespace,
        prop: podRingFirehoseProps[kind],
      });
      break;
    case DaemonSetModel.kind:
      resources.push({
        isList: true,
        kind,
        namespace,
        prop: podRingFirehoseProps[kind],
      });
      break;
    default:
      break;
  }

  return (
    <Firehose resources={resources}>
      <Controller render={render} kind={kind} />
    </Firehose>
  );
};

export default React.memo(PodRingController);
