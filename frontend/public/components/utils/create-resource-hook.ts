import * as React from 'react';
import { isCreateResource, CreateResource } from '@console/dynamic-plugin-sdk';
import { Extension, LoadedExtension, useExtensions } from '@console/plugin-sdk';
import { referenceForExtensionModel } from '../../module/k8s';

export const useCreateResourceExtension = (
  modelReference: string,
): LoadedExtension<CreateResource> => {
  const createResourceTypeGuard = React.useCallback(
    (e: Extension): e is CreateResource => {
      return (
        isCreateResource(e) && referenceForExtensionModel(e.properties.model) === modelReference
      );
    },
    [modelReference],
  );
  const extensionPages = useExtensions<CreateResource>(createResourceTypeGuard);
  return extensionPages?.[0];
};
