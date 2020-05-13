import * as React from 'react';
import { useField, useFormikContext, FormikValues } from 'formik';
import { FormGroup } from '@patternfly/react-core';
import { DropdownFieldProps } from '@console/shared/src/components/formik-fields/field-types';
import { useFormikValidationFix } from '@console/shared/src/hooks/formik-validation-fix';
import PipelineResourceParam from '../../pipeline-resource/PipelineResourceParam';
import { CREATE_PIPELINE_RESOURCE } from './const';
import { PipelineModalFormResource } from './types';
import PipelineResourceDropdown from './PipelineResourceDropdown';

type PipelineResourceDropdownFieldProps = DropdownFieldProps & {
  filterType?: string;
};
const PipelineResourceDropdownField: React.FC<PipelineResourceDropdownFieldProps> = (props) => {
  const { filterType, name, label } = props;

  const [field] = useField<PipelineModalFormResource>(name);
  const { values } = useFormikContext<FormikValues>();
  const { namespace } = values;
  const {
    value: { selection },
  } = field;
  const creating = selection === CREATE_PIPELINE_RESOURCE;

  useFormikValidationFix(field.value);

  return (
    <>
      <FormGroup fieldId={name} label={label} isRequired>
        <PipelineResourceDropdown
          {...props}
          autoSelect={selection == null}
          filterType={filterType}
          namespace={namespace}
          name={`${name}.selection`}
          selectedKey={selection}
        />
      </FormGroup>

      {creating && <PipelineResourceParam name={`${name}.data`} type={filterType} />}
    </>
  );
};

export default PipelineResourceDropdownField;
