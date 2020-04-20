import * as React from 'react';
import gql from 'graphql-tag';
import DashboardCard from '@console/shared/src/components/dashboard/dashboard-card/DashboardCard';
import DashboardCardBody from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardBody';
import DashboardCardHeader from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardHeader';
import DashboardCardTitle from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardTitle';
import { ResourceInventoryItem } from '@console/shared/src/components/dashboard/inventory-card/InventoryItem';
import { PodKind } from '../../../module/k8s';
import { useK8sWatchResource } from '../../utils/k8s-watch-hook';
import {
  useWatchResource,
  useWatchResourceHttp,
} from '../dashboards-page/cluster-dashboard/watchResource';
import { getPodStatusGroups } from '@console/shared/src/components/dashboard/inventory-card/utils';
import { PodModel } from '../../../models';

const args = {};

export const GQLInventoryItem = ({ query, mapper, model }) => {
  const [data, loaded, loadError] = useWatchResource(query, args, true);
  return (
    <ResourceInventoryItem
      isLoading={!loaded}
      error={!!loadError}
      kind={model}
      resources={data}
      mapper={mapper}
    />
  );
};

export const GQLHTTPInventoryItem = ({ query, mapper, model }) => {
  const [data, loaded, loadError] = useWatchResourceHttp(query);
  return (
    <ResourceInventoryItem
      isLoading={!loaded}
      error={!!loadError}
      kind={model}
      resources={data}
      mapper={mapper}
    />
  );
};

const podsHTTPQ = gql(`
  query w($continueToken: String){
    getPods(continueToken: $continueToken) {
      metadata {
        continue
      }
      items {
        metadata {
          name
          namespace
          uid
          resourceVersion
          deletionTimestamp
          creationTimestamp
        }
        status {
          phase
          reason
          initContainerStatuses {
            state {
              terminated {
                reason
                exitCode
                signal
              }
              waiting {
                reason
              }
            }
          }
          containerStatuses {
            ready
            state {
              waiting {
                reason
              }
              running {
                reason
              }
              terminated {
                reason
                exitCode
                signal
              }
            }
          }
        }
      }
    }
  }
`);

const podsSQ = gql(`
  subscription w{
    watchPods {
      type
      objects {
        metadata {
          name
          namespace
          uid
          resourceVersion
          deletionTimestamp
          creationTimestamp
        }
        status {
          phase
          reason
          initContainerStatuses {
            state {
              terminated {
                reason
                exitCode
                signal
              }
              waiting {
                reason
              }
            }
          }
          containerStatuses {
            ready
            state {
              waiting {
                reason
              }
              running {
                reason
              }
              terminated {
                reason
                exitCode
                signal
              }
            }
          }
        }
      }
  }
}
`);

let firstRender = true;
let loadedRender = true;

const FirehoseInventoryItem = ({ mapper, model }) => {
  const watchModel = React.useMemo(() => ({ kind: model.kind, isList: true }), [model]);
  if (firstRender) {
    performance.mark('firehose-render');
    firstRender = false;
  }
  const [data, loaded, loadError] = useK8sWatchResource<PodKind[]>(watchModel);
  if (loaded && loadedRender) {
    performance.mark('firehose-render-loaded');
    loadedRender = false;
    performance.measure('myPerfMarker', 'firehose-render', 'firehose-render-loaded');
  }
  return (
    <ResourceInventoryItem
      isLoading={!loaded}
      error={!!loadError}
      kind={model}
      resources={data}
      mapper={mapper}
    />
  );
};

export const InventoryCard = () => (
  <DashboardCard data-test-id="inventory-card">
    <DashboardCardHeader>
      <DashboardCardTitle>Cluster Inventory</DashboardCardTitle>
    </DashboardCardHeader>
    <DashboardCardBody>
      <GQLInventoryItem mapper={getPodStatusGroups} model={PodModel} query={podsSQ} />
      <GQLHTTPInventoryItem mapper={getPodStatusGroups} model={PodModel} query={podsHTTPQ} />
      <FirehoseInventoryItem mapper={getPodStatusGroups} model={PodModel} />
    </DashboardCardBody>
  </DashboardCard>
);
