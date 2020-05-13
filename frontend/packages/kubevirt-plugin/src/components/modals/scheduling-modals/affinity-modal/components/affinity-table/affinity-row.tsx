import * as React from 'react';
import { asVM, isVMRunning } from '../../../../../../selectors/vm';
import { isVMI } from '../../../../../../selectors/check-type';
import { VMLikeEntityKind } from '../../../../../../types/vmLike';
import { TableData, TableRow, RowFunction } from '@console/internal/components/factory/table';
import { dimensifyRow } from '@console/shared/src/utils/table-utils';
import { DASH } from '@console/shared/src/constants/ui';
import { ValidationCell } from '../../../../../table/validation-cell';
import { AffinityRowData } from '../../types';
import { AFFINITY_CONDITION_LABELS, AFFINITY_TYPE_LABLES } from '../../../shared/consts';
import { Kebab, KebabOption } from '@console/internal/components/utils/kebab';
import { pluralize } from '@console/internal/components/utils/details-page';

type AffinityRowCustomData = {
  isDisabled: boolean;
  columnClasses: string[];
  vmLikeEntity: VMLikeEntityKind;
  onEdit: (affinity: AffinityRowData) => void;
  onDelete: (affinity: AffinityRowData) => void;
};

const menuActionDelete = (affinity: AffinityRowData, onDelete): KebabOption => ({
  label: 'Delete',
  callback: () => onDelete(affinity),
});

const menuActionEdit = (affinity: AffinityRowData, onEdit): KebabOption => ({
  label: 'Edit',
  callback: () => onEdit(affinity),
});

const getActions = (
  affinity: AffinityRowData,
  vmLikeEntity: VMLikeEntityKind,
  onEdit,
  onDelete,
) => {
  const actions = [];
  if (isVMI(vmLikeEntity) || isVMRunning(asVM(vmLikeEntity))) {
    return actions;
  }
  actions.push(menuActionEdit(affinity, onEdit));
  actions.push(menuActionDelete(affinity, onDelete));
  return actions;
};

export const AffinityRow: RowFunction<AffinityRowData, AffinityRowCustomData> = (props) => {
  const {
    obj,
    customData: { isDisabled, columnClasses, vmLikeEntity, onEdit, onDelete },
    index,
    style,
  } = props;
  const { type, condition, weight, expressions, fields } = obj;
  const dimensify = dimensifyRow(columnClasses);
  const expressionsLabel = expressions?.length > 0 && pluralize(expressions.length, 'Expression');
  const fieldsLabel = fields?.length > 0 && pluralize(fields.length, 'Node Field');

  return (
    <TableRow id="affinity-row" index={index} trKey={condition} style={style}>
      <TableData className={dimensify()}>
        <ValidationCell>{AFFINITY_TYPE_LABLES[type]}</ValidationCell>
      </TableData>
      <TableData className={dimensify()}>
        <ValidationCell>{AFFINITY_CONDITION_LABELS[condition]}</ValidationCell>
      </TableData>
      <TableData className={dimensify()}>
        <ValidationCell>{weight || DASH}</ValidationCell>
      </TableData>
      <TableData className={dimensify()}>
        <ValidationCell>
          <div>{expressionsLabel}</div> <div>{fieldsLabel}</div>
        </ValidationCell>
      </TableData>
      <TableData className={dimensify(true)}>
        <Kebab
          options={getActions(obj, vmLikeEntity, onEdit, onDelete)}
          isDisabled={isDisabled || isVMI(vmLikeEntity) || isVMRunning(asVM(vmLikeEntity))}
        />
      </TableData>
    </TableRow>
  );
};
