import * as React from 'react';
import * as _ from 'lodash';
import Helmet from 'react-helmet';
import {
  referenceForModel,
  MachineKind,
  NodeKind,
  K8sResourceKind,
} from '@console/internal/module/k8s';
import {
  FirehoseResource,
  FirehoseResult,
  ResourceLink,
  Timestamp,
} from '@console/internal/components/utils';
import { MachineModel, NodeModel, CertificateSigningRequestModel } from '@console/internal/models';
import { createLookup, getName, getMachineNodeName } from '@console/shared';
import {
  MultiListPage,
  ModalTitle,
  ModalBody,
  createModalLauncher,
  ModalComponentProps,
  TableRow,
  TableData,
  Table,
  RowFunction,
  ModalFooter,
} from '@console/internal/components/factory';
import { useFlag } from '@console/shared/src/hooks/flag';
import {
  useK8sWatchResource,
  WatchK8sResource,
} from '@console/internal/components/utils/k8s-watch-hook';
import { Button, pluralize, ActionGroup } from '@patternfly/react-core';
import { sortable } from '@patternfly/react-table';
import { approveCSR, denyCSR } from './menu-actions';
import { getNodeMaintenanceNodeName, getHostMachineName } from '../../selectors';
import { BareMetalNodeBundle } from '../types';
import { NodeMaintenanceModel, BareMetalHostModel } from '../../models';
import { bareMetalNodeStatus } from '../../status/baremetal-node-status';
import BareMetalNodesTable from './BareMetalNodesTable';
import { bareMetalNodeStatusFilter } from './table-filters';
import { NODE_MAINTENANCE_FLAG } from '../../features';
import { BareMetalHostKind, CertificateSigningRequestKind } from '../../types';

import './baremetal-nodes-page.scss';

const getNodeCSRs = (
  csrs: CertificateSigningRequestKind[],
  username: string,
): CertificateSigningRequestKind[] =>
  csrs
    .filter((csr) => csr.spec.username === username)
    .sort(
      (a, b) =>
        new Date(b.metadata.creationTimestamp).getTime() -
        new Date(a.metadata.creationTimestamp).getTime(),
    );

const isCSRPending = (csr: CertificateSigningRequestKind): boolean =>
  !csr.status?.conditions?.some((c) => !['Approved', 'Denied'].includes(c.type));

export const getNodeClientCSRs = (
  csrs: CertificateSigningRequestKind[] = [],
): CertificateSigningRequestKind[] => {
  return csrs;
  /*
  const nodeCSRs = getNodeCSRs(
    csrs,
    'system:serviceaccount:openshift-machine-config-operator:node-bootstrapper'
  );
  return nodeCSRs.filter((csr) => !isCSRApproved(csr));
  */
  // TODO we need to group the same requests
  /*
  const groupped = _.groupBy(nodeCSRs, (csr) => csr.spec.uid);
  return Object.keys(groupped)
    .filter((key) => isCSRPending(groupped[key][0]))
    .map((key) => groupped[key][0]);
  */
};

export const getNodeServerCSR = (
  csrs: CertificateSigningRequestKind[] = [],
  node: NodeKind,
): CertificateSigningRequestKind => {
  const nodeCSRs = getNodeCSRs(csrs, `system:node:${node.metadata.name}`);
  if (!nodeCSRs.length || !isCSRPending(nodeCSRs[0])) {
    return null;
  }
  return nodeCSRs[0];
};

const flattenResources = (resources: {
  hosts: FirehoseResult<BareMetalHostKind[]>;
  machines: FirehoseResult<MachineKind[]>;
  nodes: FirehoseResult<NodeKind[]>;
  nodeMaintenances?: FirehoseResult<K8sResourceKind[]>;
  csrs: FirehoseResult<CertificateSigningRequestKind[]>;
}): BareMetalNodeBundle[] => {
  // TODO(jtomasek): Remove loaded check once ListPageWrapper_ is updated to call flatten only
  // when resources are loaded
  const loaded = _.every(
    resources,
    (resource) => resource.loaded || (resource.optional && !_.isEmpty(resource.loadError)),
  );
  if (!loaded) return [];

  const { hosts, machines, nodes, nodeMaintenances, csrs } = resources;

  const maintenancesByNodeName = createLookup(nodeMaintenances, getNodeMaintenanceNodeName);
  const hostsByMachineName = createLookup(hosts, getHostMachineName);
  const machinesByNodeName = createLookup(machines, getMachineNodeName);

  return nodes?.data?.map((node) => {
    const nodeName = getName(node);
    const machine = machinesByNodeName[nodeName];
    const host = hostsByMachineName[getName(machine)];
    const nodeMaintenance = maintenancesByNodeName[nodeName];
    const csr = getNodeServerCSR(csrs.data, node);
    const status = bareMetalNodeStatus({ node, nodeMaintenance });
    // TODO(jtomasek): metadata.name is needed to make 'name' textFilter work.
    // Remove it when it is possible to pass custom textFilter as a function
    return { host, machine, node, nodeMaintenance, status, csr };
  });
};

type CSRModalProps = ModalComponentProps & {
  csrs: CertificateSigningRequestKind[];
};

type CSRTableRowProps = {
  obj: CertificateSigningRequestKind;
  index: number;
  rowKey: string;
  style: object;
  close: () => void;
  setError: (msg: string) => void;
};

const CSRTableRow: React.FC<CSRTableRowProps> = ({
  obj,
  index,
  rowKey,
  style,
  close,
  setError,
}) => {
  const [inProgress, setInProgress] = React.useState(false);
  const updateCSR = async (approve: boolean) => {
    setError(null);
    setInProgress(true);
    try {
      await (approve ? approveCSR(obj) : denyCSR(obj));
    } catch (err) {
      setError(`${obj.metadata.name} ${approve ? 'approval' : 'denial'} failed - ${err}`);
    } finally {
      setInProgress(false);
    }
  };
  return (
    <TableRow id={obj.metadata.uid} index={index} trKey={rowKey} style={style}>
      <TableData>
        <ResourceLink
          kind={CertificateSigningRequestModel.kind}
          name={obj.metadata.name}
          onClick={close}
        />
      </TableData>
      <TableData>
        <Timestamp timestamp={obj.metadata.creationTimestamp} />
      </TableData>
      <TableData>
        <Button
          variant="link"
          onClick={() => updateCSR(true)}
          isDisabled={inProgress}
          isInline
          className="bmh-csr-action"
        >
          Approve
        </Button>
        <Button variant="link" onClick={() => updateCSR(false)} isDisabled={inProgress} isInline>
          Deny
        </Button>
      </TableData>
    </TableRow>
  );
};

const csrTableHeader = () => [
  {
    title: 'Name',
    sortField: 'csr.metadata.name',
    transforms: [sortable],
  },
  {
    title: 'Created',
    sortField: 'csr.metadata.creationTimestamp',
    transforms: [sortable],
  },
  {
    title: '',
  },
];

const CSRModal: React.FC<CSRModalProps> = ({ csrs, close }) => {
  const [error, setError] = React.useState<string>();
  const Row = React.useCallback<RowFunction<CertificateSigningRequestKind>>(
    (rowProps) => (
      <CSRTableRow
        obj={rowProps.obj}
        index={rowProps.index}
        rowKey={rowProps.key}
        style={rowProps.style}
        close={close}
        setError={setError}
      />
    ),
    [close, setError],
  );
  return (
    <div className="modal-content">
      <ModalTitle>Certificate Signing Requests</ModalTitle>
      <ModalBody>
        <Table
          data={csrs}
          defaultSortField="csr.metadata.name"
          aria-label="CSRs"
          Header={csrTableHeader}
          Row={Row}
          loaded
        />
      </ModalBody>
      <ModalFooter inProgress={false} errorMessage={error}>
        <ActionGroup className="pf-c-form pf-c-form__actions--right pf-c-form__group--no-top-margin">
          <Button
            type="button"
            variant="secondary"
            data-test-id="modal-cancel-action"
            onClick={close}
          >
            {'Close'}
          </Button>
        </ActionGroup>
      </ModalFooter>
    </div>
  );
};

const csrsModalLauncher = createModalLauncher<CSRModalProps>(CSRModal);

const csrResource: WatchK8sResource = {
  kind: CertificateSigningRequestModel.kind,
  isList: true,
};

const BareMetalNodesPage: React.FC = (props) => {
  const hasNodeMaintenanceCapability = useFlag(NODE_MAINTENANCE_FLAG);
  const [csrs, loaded, error] = useK8sWatchResource<CertificateSigningRequestKind[]>(csrResource);
  const clientCSRs = loaded && !error ? getNodeClientCSRs(csrs) : null;
  const resources: FirehoseResource[] = [
    {
      kind: referenceForModel(BareMetalHostModel),
      namespaced: true,
      prop: 'hosts',
    },
    {
      kind: referenceForModel(MachineModel),
      namespaced: true,
      prop: 'machines',
    },
    {
      kind: NodeModel.kind,
      namespaced: false,
      prop: 'nodes',
    },
    {
      ...csrResource,
      prop: 'csrs',
    },
  ];

  if (hasNodeMaintenanceCapability) {
    resources.push({
      kind: referenceForModel(NodeMaintenanceModel),
      namespaced: false,
      prop: 'nodeMaintenances',
      optional: true,
    });
  }

  const badge = loaded && !error && !!clientCSRs.length && (
    <Button onClick={() => csrsModalLauncher({ csrs })} variant="secondary">
      {pluralize(csrs.length, 'Node request')}
    </Button>
  );

  return (
    <div className="co-m-list">
      <Helmet>
        <title>Nodes</title>
      </Helmet>
      <MultiListPage
        {...props}
        rowFilters={[bareMetalNodeStatusFilter]}
        resources={resources}
        flatten={flattenResources}
        ListComponent={BareMetalNodesTable}
        title="Nodes"
        badge={badge}
      />
    </div>
  );
};

export default BareMetalNodesPage;
