import * as React from 'react';
import * as _ from 'lodash';
import { Link } from 'react-router-dom';
import { K8sResourceKind } from '@console/internal/module/k8s/types';
import { referenceFor } from '@console/internal/module/k8s/k8s-models';
import { Status } from '@console/shared/src/components/status/Status';
import { TableData, TableRow, RowFunction } from '@console/internal/components/factory/table';
import { tableColumnClasses } from './HelmReleaseResourcesHeader';
import { resourcePath, ResourceLink } from '@console/internal/components/utils/resource-link';
import { Timestamp } from '@console/internal/components/utils/timestamp';

const HelmReleaseResourcesRow: RowFunction<K8sResourceKind> = ({
  obj: resource,
  index,
  key,
  style,
}) => {
  const kind = referenceFor(resource);
  const status = resource.status?.replicas ? (
    <Link
      to={`${resourcePath(kind, resource.metadata.name, resource.metadata.namespace)}/pods`}
      title="pods"
    >
      {resource.status.replicas || 0} of {resource.spec.replicas} pods
    </Link>
  ) : (
    <Status status={_.get(resource.status, 'phase', 'Created')} />
  );
  return (
    <TableRow id={resource.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses.name}>
        <ResourceLink
          kind={kind}
          name={resource.metadata.name}
          namespace={resource.metadata.namespace}
        />
      </TableData>
      <TableData className={tableColumnClasses.type}>{resource.kind}</TableData>
      <TableData className={tableColumnClasses.status}>{status}</TableData>
      <TableData className={tableColumnClasses.created}>
        <Timestamp timestamp={resource.metadata.creationTimestamp} />
      </TableData>
    </TableRow>
  );
};

export default HelmReleaseResourcesRow;
