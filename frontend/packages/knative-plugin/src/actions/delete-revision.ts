import { KebabOption } from '@console/internal/components/utils/kebab';
import { K8sKind, K8sResourceKind } from '@console/internal/module/k8s/types';
import { deleteRevisionModal } from '../components/modals';

export const deleteRevision = (model: K8sKind, revision: K8sResourceKind): KebabOption => {
  return {
    label: `Delete ${model.label}`,
    callback: () =>
      deleteRevisionModal({
        revision,
      }),
    accessReview: {
      group: model.apiGroup,
      resource: model.plural,
      name: revision.metadata.name,
      namespace: revision.metadata.namespace,
      verb: 'delete',
    },
  };
};
