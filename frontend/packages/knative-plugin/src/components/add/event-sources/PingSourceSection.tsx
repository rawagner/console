import * as React from 'react';
import { TextInputTypes } from '@patternfly/react-core';
import FormSection from '@console/dev-console/src/components/import/section/FormSection';
import InputField from '@console/shared/src/components/formik-fields/InputField';

const PingSourceSection: React.FC = () => (
  <FormSection title="PingSource" extraMargin>
    <InputField type={TextInputTypes.text} name="data.pingsource.data" label="Data" />
    <InputField
      type={TextInputTypes.text}
      name="data.pingsource.schedule"
      label="Schedule"
      helpText="Schedule is described using the unix-cron string format (* * * * *)"
      required
    />
  </FormSection>
);

export default PingSourceSection;
