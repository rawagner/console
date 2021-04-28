import { TFunction } from 'i18next';
import * as _ from 'lodash';
import { RowFilter } from '@console/internal/components/filter-toolbar';
import { VM_STATUS_SIMPLE_LABELS } from '../../constants/vm/vm-status';
import { VMStatusBundle } from '../../statuses/vm/types';
import { getVMStatus } from '../../statuses/vm/vm-status';
import { VmStatusResourcesValue } from '../vm-status/use-vm-status-resources';
import { VMRowObjType } from './types';

export const vmStatusFilter: RowFilter<VMRowObjType> = {
  filterGroupName: 'Status',
  type: 'vm-status',
  reducer: (obj) => obj?.metadata?.vmStatusBundle?.status?.getSimpleLabel(),
  items: VM_STATUS_SIMPLE_LABELS.map((status) => ({
    id: status,
    title: status,
  })),
  filter: (statuses, obj) => {
    const status = obj?.metadata?.vmStatusBundle?.status.getSimpleLabel();
    return (
      !statuses.selected?.length ||
      statuses.selected?.includes(status) ||
      !_.includes(statuses.all, status)
    );
  },
};

export const useVmStatusFilter = (
  { pods, migrations, pvcs, dvs, loaded }: VmStatusResourcesValue,
  t: TFunction,
): RowFilter<VMRowObjType>[] => {
  const getVmStatusLabel = (obj: any) => {
    const vmStatusBundle: VMStatusBundle = loaded
      ? getVMStatus({
          vm: obj?.vm,
          vmi: obj?.vmi,
          pods,
          migrations,
          pvcs,
          dataVolumes: dvs,
          vmImports: [],
        })
      : ({} as VMStatusBundle);

    return vmStatusBundle?.status?.getSimpleLabel();
  };

  const vmFilter: RowFilter = {
    filterGroupName: t('kubevirt-plugin~Status'),
    type: 'vm-status',
    reducer: getVmStatusLabel,
    items: VM_STATUS_SIMPLE_LABELS.map((status) => ({
      id: status,
      title: status,
    })),
    filter: (statuses, obj) => {
      const status = getVmStatusLabel(obj);
      return (
        statuses.selected.length === 0 ||
        statuses.selected.includes(status) ||
        !statuses.all?.includes(status)
      );
    },
  };

  return [vmFilter];
};
