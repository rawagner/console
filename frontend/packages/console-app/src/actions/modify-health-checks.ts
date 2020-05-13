import * as _ from 'lodash';
import { referenceForModel } from '@console/internal/module/k8s/k8s';
import { K8sKind, K8sResourceKind } from '@console/internal/module/k8s/types';
import { KebabOption } from '@console/internal/components/utils/kebab';

const healthChecksAdded = (resource: K8sResourceKind): boolean => {
  const containers = resource?.spec?.template?.spec?.containers;
  return _.every(
    containers,
    (container) => container.readinessProbe || container.livenessProbe || container.startupProbe,
  );
};

const healthChecksUrl = (model: K8sKind, obj: K8sResourceKind): string => {
  const {
    kind,
    metadata: { name, namespace },
  } = obj;
  const resourceKind = model.crd ? referenceForModel(model) : kind;
  const containers = obj?.spec?.template?.spec?.containers;
  const containerName = containers?.[0]?.name;
  return `/k8s/ns/${namespace}/${resourceKind}/${name}/containers/${containerName}/health-checks`;
};

export const AddHealthChecks = (model: K8sKind, obj: K8sResourceKind): KebabOption => {
  return {
    label: 'Add Health Checks',
    hidden: healthChecksAdded(obj),
    href: healthChecksUrl(model, obj),
    accessReview: {
      group: model.apiGroup,
      resource: model.plural,
      name: obj.metadata.name,
      namespace: obj.metadata.namespace,
      verb: 'update',
    },
  };
};

export const EditHealthChecks = (model: K8sKind, obj: K8sResourceKind): KebabOption => {
  return {
    label: 'Edit Health Checks',
    hidden: !healthChecksAdded(obj),
    href: healthChecksUrl(model, obj),
    accessReview: {
      group: model.apiGroup,
      resource: model.plural,
      name: obj.metadata.name,
      namespace: obj.metadata.namespace,
      verb: 'update',
    },
  };
};
