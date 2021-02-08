import * as React from 'react';
import { PipelineRunKind } from '../../../types';
import { PipelineRunModel } from '../../../models';
import { pipelineRunFilterReducer } from '../../../utils/pipeline-filter-reducer';
import ResultsList from '../../shared/results/ResultsList';
import PipelineRunDetailsSection from './PipelineRunDetailsSection';
import './TriggeredBySection.scss';

export interface PipelineRunDetailsProps {
  obj: PipelineRunKind;
}

export const PipelineRunDetails: React.FC<PipelineRunDetailsProps> = ({ obj: pipelineRun }) => {
  return (
    <>
      <div className="co-m-pane__body odc-pipeline-run-details">
        <PipelineRunDetailsSection pipelineRun={pipelineRun} />
      </div>

      {pipelineRun.status?.pipelineResults && (
        <div className="co-m-pane__body">
          <ResultsList
            results={pipelineRun.status?.pipelineResults}
            resourceName={PipelineRunModel.label}
            status={pipelineRunFilterReducer(pipelineRun)}
          />
        </div>
      )}
    </>
  );
};
