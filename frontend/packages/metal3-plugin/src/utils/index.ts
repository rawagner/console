import { FirehoseResult } from '@console/internal/components/utils/types';
import { K8sResourceKind } from '@console/internal/module/k8s/types';

export const getLoadedData = (
  result: FirehoseResult<K8sResourceKind | K8sResourceKind[]>,
  defaultValue = null,
) => (result && result.loaded && !result.loadError ? result.data : defaultValue);
