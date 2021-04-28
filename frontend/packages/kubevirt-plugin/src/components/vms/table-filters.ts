import * as _ from 'lodash';
import { RowFilter } from '@console/internal/components/filter-toolbar';
import { VM_STATUS_SIMPLE_LABELS } from '../../constants/vm/vm-status';
import { VMRowObjType } from './vm';

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
