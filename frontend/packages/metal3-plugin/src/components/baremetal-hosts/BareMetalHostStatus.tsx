import * as React from 'react';
import { Button } from 'patternfly-react';
import { AddCircleOIcon } from '@patternfly/react-icons';
import { Alert } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import {
  ProgressStatus,
  SuccessStatus,
  ErrorStatus,
  Status,
  StatusIconAndText,
  getNamespace,
  PopoverStatus,
} from '@console/shared';
import { RequireCreatePermission, resourcePathFromModel } from '@console/internal/components/utils';
import { K8sResourceKind } from '@console/internal/module/k8s';
import {
  HOST_STATUS_DISCOVERED,
  HOST_PROGRESS_STATES,
  HOST_ERROR_STATES,
  HOST_SUCCESS_STATES,
  NODE_STATUS_UNDER_MAINTENANCE,
  NODE_STATUS_STARTING_MAINTENANCE,
  NODE_STATUS_STOPPING_MAINTENANCE,
  HOST_NO_POWER_MGMT_INFO,
} from '../../constants';
import { BareMetalHostModel } from '../../models';
import { getHostErrorMessage, hasPowerManagement } from '../../selectors';
import { StatusProps } from '../types';
import MaintenancePopover from '../maintenance/MaintenancePopover';
import { BareMetalHostKind } from '../../types';

import './host-status.scss';

// TODO(jtomasek): Update this with onClick handler once add discovered host functionality
// is available
export const AddDiscoveredHostButton: React.FC<{ host: BareMetalHostKind }> = (
  { host }, // eslint-disable-line @typescript-eslint/no-unused-vars
) => {
  const namespace = getNamespace(host);

  return (
    <RequireCreatePermission model={BareMetalHostModel} namespace={namespace}>
      <Button bsStyle="link">
        <StatusIconAndText icon={<AddCircleOIcon />} title="Add host" />
      </Button>
    </RequireCreatePermission>
  );
};

type CredentialsInfoProps = {
  host: BareMetalHostKind;
  className?: string;
  noAlert?: boolean;
};

export const CredentialsInfo: React.FC<CredentialsInfoProps> = ({ className, host, noAlert }) => {
  const body = (
    <>
      <p>{HOST_NO_POWER_MGMT_INFO}</p>
      <Link
        to={`${resourcePathFromModel(
          BareMetalHostModel,
          host.metadata.name,
          host.metadata.namespace,
        )}/edit`}
      >
        Add credentials
      </Link>
    </>
  );
  return noAlert ? (
    body
  ) : (
    <Alert variant="default" isInline title="Power management not available" className={className}>
      {body}
    </Alert>
  );
};

const BareMetalHostStatus: React.FC<BareMetalHostStatusProps> = ({
  status,
  title,
  description,
  host,
  nodeMaintenance,
  showCredentials,
}) => {
  const statusTitle = title || status;
  const credentialsInfo = showCredentials && !hasPowerManagement(host) && (
    <CredentialsInfo className="bmh-credentials-info" host={host} />
  );
  let hostStatus: JSX.Element;
  switch (true) {
    case status === HOST_STATUS_DISCOVERED:
      hostStatus = <AddDiscoveredHostButton host={host}>{credentialsInfo}</AddDiscoveredHostButton>;
      break;
    case [NODE_STATUS_STARTING_MAINTENANCE, NODE_STATUS_UNDER_MAINTENANCE].includes(status):
      hostStatus = (
        <MaintenancePopover title={statusTitle} nodeMaintenance={nodeMaintenance}>
          {credentialsInfo}
        </MaintenancePopover>
      );
      break;
    case [NODE_STATUS_STOPPING_MAINTENANCE, ...HOST_PROGRESS_STATES].includes(status):
      hostStatus = (
        <ProgressStatus title={statusTitle}>
          {description}
          {credentialsInfo}
        </ProgressStatus>
      );
      break;
    case HOST_ERROR_STATES.includes(status):
      hostStatus = (
        <ErrorStatus title={statusTitle}>
          <p>{description}</p>
          <p>{getHostErrorMessage(host)}</p>
          {credentialsInfo}
        </ErrorStatus>
      );
      break;
    case HOST_SUCCESS_STATES.includes(status):
      hostStatus = (
        <SuccessStatus title={statusTitle}>
          {description}
          {credentialsInfo}
        </SuccessStatus>
      );
      break;
    default: {
      const statusBody = <Status status={status} title={statusTitle} />;

      hostStatus = credentialsInfo ? (
        <PopoverStatus title={statusTitle} statusBody={statusBody}>
          {description}
          {credentialsInfo}
        </PopoverStatus>
      ) : (
        statusBody
      );
    }
  }

  return hostStatus;
};

type BareMetalHostStatusProps = StatusProps & {
  host?: BareMetalHostKind;
  nodeMaintenance?: K8sResourceKind;
  showCredentials?: boolean;
};

export default BareMetalHostStatus;
