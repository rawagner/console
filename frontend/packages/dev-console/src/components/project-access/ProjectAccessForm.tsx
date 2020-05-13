import * as React from 'react';
import * as _ from 'lodash';
import { Form, TextInputTypes } from '@patternfly/react-core';
import { FormikProps, FormikValues } from 'formik';
import MultiColumnField from '@console/shared/src/components/formik-fields/multi-column-field/MultiColumnField';
import InputField from '@console/shared/src/components/formik-fields/InputField';
import DropdownField from '@console/shared/src/components/formik-fields/DropdownField';
import FormFooter from '@console/shared/src/components/form-utils/FormFooter';

enum accessRoles {
  '' = 'Select a role',
  admin = 'Admin',
  edit = 'Edit',
  view = 'View',
}

const ProjectAccessForm: React.FC<FormikProps<FormikValues>> = ({
  handleSubmit,
  handleReset,
  isSubmitting,
  status,
  errors,
  dirty,
}) => (
  <Form onSubmit={handleSubmit}>
    <div className="co-m-pane__form">
      <MultiColumnField
        name="projectAccess"
        addLabel="Add Access"
        headers={['Name', 'Role']}
        emptyValues={{ user: '', role: '' }}
        toolTip="Remove Access"
      >
        <InputField name="user" type={TextInputTypes.text} placeholder="Name" />
        <DropdownField name="role" items={accessRoles} fullWidth />
      </MultiColumnField>
      <hr />
      <FormFooter
        handleReset={handleReset}
        isSubmitting={isSubmitting}
        errorMessage={status && status.submitError}
        successMessage={status && !dirty && status.success}
        disableSubmit={!dirty || !_.isEmpty(errors)}
        showAlert={dirty}
      />
    </div>
  </Form>
);

export default ProjectAccessForm;
