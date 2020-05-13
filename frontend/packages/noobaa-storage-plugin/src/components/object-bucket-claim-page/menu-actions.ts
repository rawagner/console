import { K8sKind, K8sResourceKind } from '@console/internal/module/k8s/types';
import { attachDeploymentToOBCModal } from './modals/attach-deployment-obc-modal';
import { asAccessReview } from '@console/internal/components/utils/rbac';
import { Kebab } from '@console/internal/components/utils/kebab';

const attachDeployment = (kind: K8sKind, resource: K8sResourceKind) => ({
  label: 'Attach to Deployment',
  callback: () =>
    attachDeploymentToOBCModal({
      kind,
      resource,
    }),
  accessReview: asAccessReview(kind, resource, 'patch'),
});

export const menuActions = [attachDeployment, ...Kebab.factory.common];

export const menuActionCreator = (kindObj: K8sKind, resource: K8sResourceKind) =>
  menuActions.map((action) => action(kindObj, resource));
