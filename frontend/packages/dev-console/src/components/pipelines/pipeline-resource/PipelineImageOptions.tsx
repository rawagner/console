import * as React from 'react';
import { TextInputTypes } from '@patternfly/react-core';
import InputField from '@console/shared/src/components/formik-fields/InputField';

type PipelineImageOptionsProps = { prefixName: string };

const PipelineImageOptions: React.FC<PipelineImageOptionsProps> = ({ prefixName }) => (
  <InputField
    type={TextInputTypes.text}
    name={`${prefixName}.params.url`}
    label="URL"
    helpText="Please provide Image URL."
    required
  />
);

export default PipelineImageOptions;
