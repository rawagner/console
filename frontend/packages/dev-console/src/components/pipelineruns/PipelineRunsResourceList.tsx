import * as React from 'react';
import { getBadgeFromType } from '@console/shared/src/components/badges/badge-factory';
import { ListPage } from '@console/internal/components/factory/list-page';
import { referenceForModel } from '@console/internal/module/k8s/k8s';
import { PipelineRunModel } from '../../models';
import { runFilters } from '../pipelines/detail-page-tabs/PipelineRuns';
import PipelineRunsList from './list-page/PipelineRunList';

const PipelineRunsResourceList: React.FC<Omit<
  React.ComponentProps<typeof ListPage>,
  'canCreate' | 'kind' | 'ListComponent' | 'rowFilters'
>> = (props) => {
  return (
    <ListPage
      {...props}
      canCreate={false}
      kind={referenceForModel(PipelineRunModel)}
      ListComponent={PipelineRunsList}
      rowFilters={runFilters}
      badge={getBadgeFromType(PipelineRunModel.badge)}
    />
  );
};

export default PipelineRunsResourceList;
