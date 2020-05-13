import * as React from 'react';
import { DetailsPage, DetailsPageProps } from '@console/internal/components/factory/details';
import TaskRunDetails from './TaskRunDetails';
import { navFactory, viewYamlComponent } from '@console/internal/components/utils/horizontal-nav';

const TaskRunDetailsPage: React.FC<DetailsPageProps> = (props) => (
  <DetailsPage
    {...props}
    pages={[navFactory.details(TaskRunDetails), navFactory.editYaml(viewYamlComponent)]}
  />
);
export default TaskRunDetailsPage;
