import * as React from 'react';
import { NodeModel } from '@console/internal/models';
import {
  createModalLauncher,
  ModalComponentProps,
} from '@console/internal/components/factory/modal';
import { Firehose } from '@console/internal/components/utils/firehose';
import { getName, getNamespace } from '@console/shared/src/selectors/common';
import { getVMLikeModel } from '../../../../selectors/vm';
import { VMLikeEntityKind } from '../../../../types/vmLike';
import { DedicatedResourcesModal } from './dedicated-resources-modal';

const FirehoseDedicatedResourcesModal: React.FC<FirehoseDedicatedResourcesModalProps> = (props) => {
  const { vmLikeEntity, ...restProps } = props;

  const resources = [
    {
      kind: getVMLikeModel(vmLikeEntity).kind,
      name: getName(vmLikeEntity),
      namespace: getNamespace(vmLikeEntity),
      prop: 'vmLikeEntityLoading',
    },
    {
      kind: NodeModel.kind,
      isList: true,
      namespaced: false,
      prop: 'nodes',
    },
  ];

  return (
    <Firehose resources={resources}>
      <DedicatedResourcesModal vmLikeEntity={vmLikeEntity} {...restProps} />
    </Firehose>
  );
};

type FirehoseDedicatedResourcesModalProps = ModalComponentProps & {
  vmLikeEntity: VMLikeEntityKind;
};

export default createModalLauncher(FirehoseDedicatedResourcesModal);
