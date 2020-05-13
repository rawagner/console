import * as React from 'react';
import { Status } from '@console/shared/src/components/status/Status';
import { TableRow, TableData, RowFunction } from '@console/internal/components/factory/table';
import { referenceForModel } from '@console/internal/module/k8s/k8s';
import { pipelineFilterReducer } from '../../../utils/pipeline-filter-reducer';
import { Pipeline } from '../../../utils/pipeline-augment';
import { PipelineModel, PipelineRunModel } from '../../../models';
import { getPipelineKebabActions } from '../../../utils/pipeline-actions';
import LinkedPipelineRunTaskStatus from '../../pipelineruns/status/LinkedPipelineRunTaskStatus';
import { ResourceKebabWithUserLabel } from '../../pipelineruns/triggered-by';
import { tableColumnClasses } from './pipeline-table';
import { Timestamp } from '@console/internal/components/utils/timestamp';
import { ResourceLink } from '@console/internal/components/utils/resource-link';

const pipelineReference = referenceForModel(PipelineModel);
const pipelinerunReference = referenceForModel(PipelineRunModel);

const PipelineRow: RowFunction<Pipeline> = ({ obj, index, key, style }) => {
  return (
    <TableRow
      id={obj.metadata.uid}
      data-test-id={`${obj.metadata.namespace}-${obj.metadata.name}`}
      index={index}
      trKey={key}
      style={style}
    >
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink
          kind={pipelineReference}
          name={obj.metadata.name}
          namespace={obj.metadata.namespace}
          title={obj.metadata.name}
        />
      </TableData>
      <TableData className={tableColumnClasses[1]}>
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[2]}>
        {obj.latestRun && obj.latestRun.metadata && obj.latestRun.metadata.name ? (
          <ResourceLink
            kind={pipelinerunReference}
            name={obj.latestRun.metadata.name}
            namespace={obj.latestRun.metadata.namespace}
          />
        ) : (
          '-'
        )}
      </TableData>
      <TableData className={tableColumnClasses[3]}>
        {obj.latestRun ? (
          <LinkedPipelineRunTaskStatus pipeline={obj} pipelineRun={obj.latestRun} />
        ) : (
          '-'
        )}
      </TableData>
      <TableData className={tableColumnClasses[4]}>
        <Status status={pipelineFilterReducer(obj)} />
      </TableData>
      <TableData className={tableColumnClasses[5]}>
        {(obj.latestRun && obj.latestRun.status && obj.latestRun.status.completionTime && (
          <Timestamp timestamp={obj.latestRun.status.completionTime} />
        )) ||
          '-'}
      </TableData>
      <TableData className={tableColumnClasses[6]}>
        <ResourceKebabWithUserLabel
          actions={getPipelineKebabActions(obj.latestRun)}
          kind={pipelineReference}
          resource={obj}
        />
      </TableData>
    </TableRow>
  );
};

export default PipelineRow;
