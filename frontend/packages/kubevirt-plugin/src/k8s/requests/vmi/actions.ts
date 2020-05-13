import { coFetch } from '@console/internal/co-fetch';
import { resourceURL } from '@console/internal/module/k8s/resource';
import { getName, getNamespace } from '@console/shared/src/selectors/common';
import { VirtualMachineInstanceModel } from '../../../models';
import { VMIKind } from '../../../types/vm';

export enum VMIActionType {
  Unpause = 'unpause',
}

const VMIActionRequest = async (vmi: VMIKind, action: VMIActionType) => {
  const method = 'PUT';
  let url = resourceURL(
    {
      ...VirtualMachineInstanceModel,
      apiGroup: `subresources.${VirtualMachineInstanceModel.apiGroup}`,
    },
    {
      ns: getNamespace(vmi),
      name: getName(vmi),
    },
  );

  url = `${url}/${action}`;

  const response = await coFetch(url, { method });
  const text = await response.text();

  return text;
};

export const unpauseVMI = async (vmi: VMIKind) => VMIActionRequest(vmi, VMIActionType.Unpause);
