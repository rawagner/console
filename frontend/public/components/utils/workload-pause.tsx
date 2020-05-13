import * as React from 'react';
import { Alert, AlertActionLink } from '@patternfly/react-core';

import { K8sKind, K8sResourceKind } from '../../module/k8s/types';
import { k8sPatch } from '../../module/k8s/resource';
import { errorModal } from '../modals/index';

export const togglePaused = (model: K8sKind, obj: K8sResourceKind) => {
  const patch = [
    {
      path: '/spec/paused',
      op: 'add',
      value: !obj.spec.paused,
    },
  ];

  return k8sPatch(model, obj, patch);
};

export const WorkloadPausedAlert = ({ model, obj }) => {
  return (
    <Alert
      isInline
      className="co-alert"
      variant="info"
      title={<>{obj.metadata.name} is paused</>}
      action={
        <AlertActionLink
          onClick={() =>
            togglePaused(model, obj).catch((err) => errorModal({ error: err.message }))
          }
        >
          Resume Rollouts
        </AlertActionLink>
      }
    >
      This will stop any new rollouts or triggers from running until resumed.
    </Alert>
  );
};
