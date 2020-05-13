import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Firehose } from '@console/internal/components/utils/firehose';
import { FirehoseResource } from '@console/internal/components/utils/types';
import AddHealthChecksForm from './AddHealthChecksForm';

type HealthChecksProps = RouteComponentProps<{
  ns: string;
  kind: string;
  name: string;
  containerName: string;
}>;

const HealthChecksPage: React.FC<HealthChecksProps> = ({ match }) => {
  const { ns, kind, name, containerName } = match.params;
  const resource: FirehoseResource[] = [
    {
      kind,
      namespace: ns,
      isList: false,
      name,
      prop: 'resource',
    },
  ];

  return (
    <Firehose resources={resource}>
      <AddHealthChecksForm currentContainer={containerName} />
    </Firehose>
  );
};

export default HealthChecksPage;
