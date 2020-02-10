import * as React from 'react';
import {
  StatusBox,
  ScrollToTopOnMount,
  SectionHeading,
  ResourceSummary,
  ExternalLink,
} from '@console/internal/components/utils';
import { ClusterKind, ClusterStatusKind } from '../types';
import { getLabelValue, getBasicID, prefixedID } from '../selectors';
import { ClusterStatus } from './cluster-status';
import { DetailsItem } from './details-item';
import { ClusterNodes } from './cluster-nodes';

const ClusterConsole: React.FC<ClusterConsoleProps> = ({ cluster, clusterStatus }) => {
  // TODO: add endpoints for non-openshift clusters
  const consoleURL = clusterStatus && clusterStatus.spec && clusterStatus.spec.consoleURL;
  return (
    <DetailsItem
      title="Public Service Endpoint URL"
      idValue={prefixedID(getBasicID(cluster), 'cluster-console')}
      isNotAvail={!consoleURL}
    >
      <ExternalLink href={consoleURL} text="Console" />
    </DetailsItem>
  );
};

const ClusterResourceSummary: React.FC<ClusterDetailsSummaryProps> = (props) => {
  // TODO: applications, deployments
  // TODO: policy violation, security indings
  // TODO: link to Grafana
  const { cluster } = props;
  const id = getBasicID(cluster);
  const owner = null; // TODO: how to get it?

  return (
    <ResourceSummary resource={cluster}>
      <DetailsItem title="Cluster Owner" idValue={prefixedID(id, 'owner')} isNotAvail={!owner}>
        {owner}
      </DetailsItem>
    </ResourceSummary>
  );
};

const ClusterDetailsList: React.FC<ClusterDetailsListProps> = (props) => {
  const { cluster, clusterStatus } = props;
  const id = getBasicID(cluster);

  const kubernetesVersion = clusterStatus && clusterStatus.spec && clusterStatus.spec.version;
  const cloudProvider = getLabelValue(cluster, 'cloud');

  return (
    <dl className="co-m-pane__details">
      <DetailsItem title="Master Status" idValue={prefixedID(id, 'master-status')}>
        <ClusterStatus cluster={cluster} />
      </DetailsItem>

      <ClusterNodes {...props} />
      <ClusterConsole {...props} />

      <DetailsItem
        title="Cloud Provider"
        idValue={prefixedID(id, 'cloud-provider')}
        isNotAvail={!cloudProvider}
      >
        {cloudProvider}
      </DetailsItem>

      <DetailsItem
        title="Kubernetes Version"
        idValue={prefixedID(id, 'kubernetes-version')}
        isNotAvail={!kubernetesVersion}
      >
        {kubernetesVersion}
      </DetailsItem>
    </dl>
  );
};

export const ClusterDetails: React.FC<ClusterDetailsProps> = (props) => {
  const { obj: cluster, clusterStatus, ...restProps } = props;
  const mainResources = {
    cluster,
    clusterStatus,
  };

  return (
    <StatusBox data={cluster} loaded={!!cluster} {...restProps}>
      <ScrollToTopOnMount />
      <div className="co-m-pane__body">
        <SectionHeading text="Cluster Overview" />
        <div className="row">
          <div className="col-sm-6">
            <ClusterResourceSummary {...mainResources} />
          </div>
          <div className="col-sm-6">
            <ClusterDetailsList {...mainResources} />
          </div>
        </div>
      </div>
    </StatusBox>
  );
};

type ClusterDetailsSummaryProps = {
  cluster: ClusterKind;
  clusterStatus?: ClusterStatusKind;
};
type ClusterDetailsListProps = ClusterDetailsSummaryProps;
type ClusterConsoleProps = ClusterDetailsSummaryProps;

type ClusterDetailsProps = {
  obj: ClusterKind;
  clusterStatus?: ClusterStatusKind;
};
