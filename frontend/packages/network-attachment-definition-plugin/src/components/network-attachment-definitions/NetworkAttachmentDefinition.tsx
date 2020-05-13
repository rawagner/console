import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { ListPage } from '@console/internal/components/factory/list-page';
import {
  Table,
  TableRow,
  TableData,
  RowFunction,
} from '@console/internal/components/factory/table';
import { NamespaceModel } from '@console/internal/models';
import { referenceForModel } from '@console/internal/module/k8s/k8s';
import { getName, getNamespace, getUID } from '@console/shared/src/selectors/common';
import { dimensifyHeader, dimensifyRow } from '@console/shared/src/utils/table-utils';
import { NetworkAttachmentDefinitionModel } from '../../models';
import { getConfigAsJSON, getType } from '../../selectors';
import { NetworkAttachmentDefinitionKind } from '../../types';
import { NetAttachDefBundle, NetworkAttachmentDefinitionsPageProps } from './types';
import { ResourceLink } from '@console/internal/components/utils/resource-link';
import { ResourceKebab, Kebab } from '@console/internal/components/utils/kebab';

const { common } = Kebab.factory;
const menuActions = [...common];

const tableColumnClasses = [
  classNames('col-lg-4', 'col-md-4', 'col-sm-6', 'col-xs-6'),
  classNames('col-lg-4', 'col-md-4', 'hidden-sm', 'hidden-xs'),
  classNames('col-lg-4', 'col-md-4', 'col-sm-6', 'col-xs-6'),
  Kebab.columnClass,
];

const NetworkAttachmentDefinitionsHeader = () =>
  dimensifyHeader(
    [
      {
        title: 'Name',
        sortField: 'name',
        transforms: [sortable],
      },
      {
        title: 'Namespace',
        sortField: 'namespace',
        transforms: [sortable],
      },
      {
        title: 'Type',
        sortField: 'type',
        transforms: [sortable],
      },
      {
        title: '',
      },
    ],
    tableColumnClasses,
  );

const NetworkAttachmentDefinitionsRow: RowFunction<NetAttachDefBundle> = ({
  obj: { name, namespace, type, metadata, netAttachDef },
  index,
  key,
  style,
}) => {
  const dimensify = dimensifyRow(tableColumnClasses);

  return (
    <TableRow id={metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={dimensify()}>
        <ResourceLink
          kind={referenceForModel(NetworkAttachmentDefinitionModel)}
          name={name}
          namespace={namespace}
        />
      </TableData>
      <TableData className={dimensify()}>
        <ResourceLink kind={NamespaceModel.kind} name={namespace} title={namespace} />
      </TableData>
      <TableData className={dimensify()}>
        {type || <span className="text-secondary">Not available</span>}
      </TableData>
      <TableData className={dimensify(true)}>
        <ResourceKebab
          actions={menuActions}
          kind={referenceForModel(NetworkAttachmentDefinitionModel)}
          resource={netAttachDef}
        />
      </TableData>
    </TableRow>
  );
};

const getNetAttachDefsData = (nadList: NetworkAttachmentDefinitionKind[]): NetAttachDefBundle[] => {
  return nadList
    ? nadList.map((netAttachDef) => {
        const configJSON = getConfigAsJSON(netAttachDef);
        return {
          netAttachDef,
          metadata: { uid: getUID(netAttachDef) },
          configJSON,
          // for sorting
          name: getName(netAttachDef),
          namespace: getNamespace(netAttachDef),
          type: getType(configJSON),
        };
      })
    : [];
};

export const NetworkAttachmentDefinitionsList: React.FC<React.ComponentProps<typeof Table>> = (
  props,
) => {
  return (
    <Table
      data={getNetAttachDefsData(props.data)}
      aria-label={NetworkAttachmentDefinitionModel.labelPlural}
      Header={NetworkAttachmentDefinitionsHeader}
      Row={NetworkAttachmentDefinitionsRow}
      virtualize
      loaded={props.loaded}
    />
  );
};
NetworkAttachmentDefinitionsList.displayName = 'NetworkAttachmentDefinitionsList';

export const NetworkAttachmentDefinitionsPage: React.FC<NetworkAttachmentDefinitionsPageProps> = (
  props,
) => {
  const namespace = props.namespace || props.match.params.ns || 'default';
  const createProps = {
    to: `/k8s/ns/${namespace}/${referenceForModel(NetworkAttachmentDefinitionModel)}/~new/form`,
  };

  return (
    <ListPage
      {...props}
      title={NetworkAttachmentDefinitionModel.labelPlural}
      kind={referenceForModel(NetworkAttachmentDefinitionModel)}
      ListComponent={NetworkAttachmentDefinitionsList}
      filterLabel={props.filterLabel}
      canCreate
      createProps={createProps}
    />
  );
};
NetworkAttachmentDefinitionsPage.displayName = 'NetworkAttachmentDefinitionsPage';

export default NetworkAttachmentDefinitionsPage;
