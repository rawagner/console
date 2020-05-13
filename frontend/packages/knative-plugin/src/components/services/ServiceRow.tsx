import * as React from 'react';
import * as cx from 'classnames';
import { TableRow, TableData, RowFunction } from '@console/internal/components/factory/table';
import { referenceForModel } from '@console/internal/module/k8s/k8s';
import { referenceFor } from '@console/internal/module/k8s/k8s-models';
import { K8sKind } from '@console/internal/module/k8s/types';
import { ServiceModel } from '../../models';
import { getConditionString, getCondition } from '../../utils/condition-utils';
import { ServiceKind, ConditionTypes } from '../../types';
import { tableColumnClasses } from './service-table';
import { kindObj } from '@console/internal/components/utils/inject';
import { Kebab, ResourceKebab } from '@console/internal/components/utils/kebab';
import { ResourceLink } from '@console/internal/components/utils/resource-link';
import { Timestamp } from '@console/internal/components/utils/timestamp';
import { ExternalLink } from '@console/internal/components/utils/link';

const serviceReference = referenceForModel(ServiceModel);

const ServiceRow: RowFunction<ServiceKind> = ({ obj, index, key, style }) => {
  const readyCondition = obj.status
    ? getCondition(obj.status.conditions, ConditionTypes.Ready)
    : null;
  const kind = kindObj(referenceFor(obj)) as K8sKind;
  const menuActions = [...Kebab.getExtensionsActionsForKind(kind), ...Kebab.factory.common];

  return (
    <TableRow id={obj.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink
          kind={serviceReference}
          name={obj.metadata.name}
          namespace={obj.metadata.namespace}
          title={obj.metadata.uid}
        />
      </TableData>
      <TableData className={cx(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} />
      </TableData>
      <TableData className={cx(tableColumnClasses[2], 'co-break-word')}>
        {(obj.status && obj.status.url && (
          <ExternalLink href={obj.status.url} text={obj.status.url} />
        )) ||
          '-'}
      </TableData>
      <TableData className={tableColumnClasses[3]}>{obj.metadata.generation || '-'}</TableData>
      <TableData className={tableColumnClasses[4]}>
        <Timestamp timestamp={obj.metadata.creationTimestamp} />
      </TableData>
      <TableData className={tableColumnClasses[5]}>
        {obj.status ? getConditionString(obj.status.conditions) : '-'}
      </TableData>
      <TableData className={tableColumnClasses[6]}>
        {(readyCondition && readyCondition.status) || '-'}
      </TableData>
      <TableData className={tableColumnClasses[7]}>
        {(readyCondition && readyCondition.message) || '-'}
      </TableData>
      <TableData className={tableColumnClasses[8]}>
        <ResourceKebab actions={menuActions} kind={serviceReference} resource={obj} />
      </TableData>
    </TableRow>
  );
};

export default ServiceRow;
