import * as React from 'react';
import { FormikProps, FormikValues } from 'formik';
import { TextInputTypes } from '@patternfly/react-core';
import { RevisionItems } from '../../utils/traffic-splitting-utils';
import MultiColumnField from '@console/shared/src/components/formik-fields/multi-column-field/MultiColumnField';
import InputField from '@console/shared/src/components/formik-fields/InputField';
import DropdownField from '@console/shared/src/components/formik-fields/DropdownField';

interface TrafficSplittingFieldProps {
  revisionItems: RevisionItems;
}

type Props = FormikProps<FormikValues> & TrafficSplittingFieldProps;

const TrafficSplittingFields: React.FC<Props> = ({ revisionItems, values }) => {
  return (
    <MultiColumnField
      name="trafficSplitting"
      addLabel="Add Revision"
      headers={['Split', 'Tag', 'Revision']}
      emptyValues={{ percent: '', tag: '', revisionName: '' }}
      disableDeleteRow={values.trafficSplitting.length === 1}
      spans={[2, 3, 7]}
    >
      <InputField
        name="percent"
        type={TextInputTypes.number}
        placeholder="100"
        style={{ maxWidth: '100%' }}
        required
      />
      <InputField name="tag" type={TextInputTypes.text} />
      <DropdownField
        name="revisionName"
        items={revisionItems}
        title="Select a revision"
        fullWidth
        required
      />
    </MultiColumnField>
  );
};

export default TrafficSplittingFields;
