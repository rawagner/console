import * as React from 'react';
import { DetailsPage, DetailsPageProps } from '@console/internal/components/factory/details';
import { pipelineRunStatus } from '../../utils/pipeline-filter-reducer';
import { getPipelineRunKebabActions } from '../../utils/pipeline-actions';
import { PipelineRunDetails } from './detail-page-tabs/PipelineRunDetails';
import { PipelineRunLogsWithActiveTask } from './detail-page-tabs/PipelineRunLogs';
import { useMenuActionsWithUserLabel } from './triggered-by';
import { KebabAction } from '@console/internal/components/utils/kebab';
import { navFactory, viewYamlComponent } from '@console/internal/components/utils/horizontal-nav';

const PipelineRunDetailsPage: React.FC<DetailsPageProps> = (props) => {
  const menuActions: KebabAction[] = useMenuActionsWithUserLabel(getPipelineRunKebabActions(true));

  return (
    <DetailsPage
      {...props}
      menuActions={menuActions}
      getResourceStatus={pipelineRunStatus}
      pages={[
        navFactory.details(PipelineRunDetails),
        navFactory.editYaml(viewYamlComponent),
        {
          href: 'logs',
          path: 'logs/:name?',
          name: 'Logs',
          component: PipelineRunLogsWithActiveTask,
        },
      ]}
    />
  );
};

export default PipelineRunDetailsPage;
