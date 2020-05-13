import * as React from 'react';
import * as _ from 'lodash';
import ODCEmptyState from './EmptyState';
import { LoadingBox } from '@console/internal/components/utils/status-box';
import { HintBlock } from '@console/internal/components/utils/hint-block';
import { FirehoseResult } from '@console/internal/components/utils/types';

export interface ProjectsExistWrapperProps {
  title: string;
  projects?: FirehoseResult;
  children: React.ReactElement;
}

const ProjectsExistWrapper: React.FC<ProjectsExistWrapperProps> = ({
  title,
  projects,
  children,
}) => {
  if (!projects.loaded) {
    return <LoadingBox />;
  }

  if (_.isEmpty(projects.data)) {
    return (
      <ODCEmptyState
        title={title}
        hintBlock={
          <HintBlock title="No projects exist">
            <p>
              Select one of the following options to create an application, component or service. As
              part of the creation process a project and application will be created.
            </p>
          </HintBlock>
        }
      />
    );
  }

  return children;
};

export default ProjectsExistWrapper;
