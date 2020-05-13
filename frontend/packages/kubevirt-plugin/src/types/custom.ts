import { FirehoseResource } from '@console/internal/components/utils/types';
import { K8sKind } from '@console/internal/module/k8s/types';

export type FirehoseResourceEnhanced = FirehoseResource & {
  model: K8sKind;
  errorBehaviour?: {
    ignore404?: boolean;
  };
};
