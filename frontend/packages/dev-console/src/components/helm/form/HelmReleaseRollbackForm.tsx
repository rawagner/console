import * as React from 'react';
import * as _ from 'lodash';
import { FormikProps, FormikValues } from 'formik';
import { Form, FormGroup } from '@patternfly/react-core';
import { SortByDirection } from '@patternfly/react-table';
import FormFooter from '@console/shared/src/components/form-utils/FormFooter';
import { Table } from '@console/internal/components/factory/table';
import { HelmRelease } from '../helm-types';

import RevisionListHeader from './rollback/RevisionListHeader';
import RevisionListRow from './rollback/RevisionListRow';

interface HelmReleaseRollbackFormProps {
  releaseHistory: HelmRelease[];
}

type Props = FormikProps<FormikValues> & HelmReleaseRollbackFormProps;

const HelmReleaseRollbackForm: React.FC<Props> = ({
  errors,
  handleSubmit,
  handleReset,
  status,
  isSubmitting,
  dirty,
  releaseHistory,
}) => {
  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup fieldId="revision-list-field" label="Revision History" isRequired>
        <Table
          data={releaseHistory}
          defaultSortField="version"
          defaultSortOrder={SortByDirection.desc}
          aria-label="CustomResources"
          Header={RevisionListHeader}
          Row={RevisionListRow}
          loaded={!!releaseHistory}
          virtualize
        />
      </FormGroup>
      <FormFooter
        handleReset={handleReset}
        errorMessage={status?.submitError}
        isSubmitting={status?.isSubmitting || isSubmitting}
        submitLabel="Rollback"
        disableSubmit={status?.isSubmitting || !dirty || !_.isEmpty(errors)}
        resetLabel="Cancel"
        sticky
      />
    </Form>
  );
};

export default HelmReleaseRollbackForm;
