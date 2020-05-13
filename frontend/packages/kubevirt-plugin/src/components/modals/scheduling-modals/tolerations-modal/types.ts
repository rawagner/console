import { Toleration } from '@console/internal/module/k8s/types';
import { IDLabel } from '../../../LabelsList/types';

export type TolerationLabel = IDLabel & Toleration;
