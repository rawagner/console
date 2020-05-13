import * as React from 'react';
import { TableData, TableRow } from '@console/internal/components/factory/table';
import { LoadingInline } from '@console/internal/components/utils/status-box';
import { dimensifyRow } from '@console/shared/src/utils/table-utils';
import { DASH } from '@console/shared/src/constants/ui';
import { ValidationCell } from '../table/validation-cell';
import { StorageSimpleData, StorageSimpleDataValidation } from './types';

export type VMCDSimpleRowProps = {
  data: StorageSimpleData;
  validation?: StorageSimpleDataValidation;
  columnClasses: string[];
  actionsComponent: React.ReactNode;
  index: number;
  style: object;
};

export const CDSimpleRow: React.FC<VMCDSimpleRowProps> = ({
  data: { source, content, diskInterface, storageClass },
  validation = {},
  columnClasses,
  actionsComponent,
  index,
  style,
}) => {
  const dimensify = dimensifyRow(columnClasses);

  const isStorageClassLoading = storageClass === undefined;

  return (
    <TableRow id={content} index={index} trKey={content} style={style}>
      <TableData className={dimensify()}>
        <ValidationCell validation={validation.content}>{content}</ValidationCell>
      </TableData>
      <TableData className={dimensify()}>
        <ValidationCell validation={validation.source}>{source}</ValidationCell>
      </TableData>
      <TableData className={dimensify()}>
        <ValidationCell validation={validation.diskInterface}>{diskInterface}</ValidationCell>
      </TableData>
      <TableData className={dimensify()}>
        {isStorageClassLoading && <LoadingInline />}
        {!isStorageClassLoading && (
          <ValidationCell validation={validation.storageClass}>
            {storageClass || DASH}
          </ValidationCell>
        )}
      </TableData>
      <TableData className={dimensify(true)}>{actionsComponent}</TableData>
    </TableRow>
  );
};
