import * as React from 'react';
import { shallow } from 'enzyme';
import { formikFormProps } from '@console/shared/src/test-utils/formik-props-utils';
import { ContainerDropdown } from '@console/internal/components/utils/dropdown';
import { ResourceLink } from '@console/internal/components/utils/resource-link';
import FormFooter from '@console/shared/src/components/form-utils/FormFooter';
import AddHealthChecks from '../AddHealthChecks';
import { sampleDeployments } from '../../topology/__tests__/topology-test-data';
import { getHealthChecksData } from '../create-health-checks-probe-utils';
import { getResourcesType } from '../../edit-application/edit-application-utils';
import HealthChecks from '../HealthChecks';

let addHealthCheckProbs: React.ComponentProps<typeof AddHealthChecks>;

describe('AddHealthCheck', () => {
  beforeEach(() => {
    addHealthCheckProbs = {
      ...formikFormProps,
      currentContainer: 'wit-deployment',
      resource: sampleDeployments.data[2],
      values: {
        containerName: 'wit-deployment',
      },
      initialValues: {
        healthChecks: getHealthChecksData(sampleDeployments.data[1]),
        containerName: 'wit-deployment',
        resources: getResourcesType(sampleDeployments.data[1]),
        image: {
          ports: sampleDeployments.data[1].spec.template.spec.containers[0].ports,
        },
      },
    };
  });

  it('should load AddHealthCheck', () => {
    const wrapper = shallow(<AddHealthChecks {...addHealthCheckProbs} />);
    expect(wrapper.find(ContainerDropdown).exists()).toBe(false);
    expect(wrapper.find(ResourceLink).exists()).toBe(true);
    expect(wrapper.find(HealthChecks).exists()).toBe(true);
    expect(wrapper.find(FormFooter).exists()).toBe(true);
  });
});
