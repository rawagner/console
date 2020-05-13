import * as React from 'react';
import * as _ from 'lodash';
import CheckboxField from '@console/shared/src/components/formik-fields/CheckboxField';
import EnvironmentField from '@console/shared/src/components/formik-fields/EnvironmentField';
import { K8sResourceKind } from '@console/internal/module/k8s/types';
import FormSection from '../section/FormSection';

export interface DeploymentConfigSectionProps {
  namespace: string;
  resource?: K8sResourceKind;
  isServerless?: boolean;
}

const DeploymentConfigSection: React.FC<DeploymentConfigSectionProps> = ({
  namespace,
  resource,
  isServerless,
}) => {
  const deploymentConfigObj = resource || {
    kind: 'DeploymentConfig',
    metadata: {
      namespace,
    },
  };
  const envs = _.get(deploymentConfigObj, 'spec.template.spec.containers[0].env', []);
  return (
    <FormSection title="Deployment" fullWidth>
      <CheckboxField
        name="deployment.triggers.image"
        label="Auto deploy when new image is available"
      />
      {!isServerless && (
        <CheckboxField
          name="deployment.triggers.config"
          label="Auto deploy when deployment configuration changes"
        />
      )}
      <EnvironmentField
        name="deployment.env"
        label="Environment Variables (Runtime only)"
        envs={envs}
        obj={deploymentConfigObj}
        envPath={['spec', 'template', 'spec', 'containers']}
      />
    </FormSection>
  );
};

export default DeploymentConfigSection;
