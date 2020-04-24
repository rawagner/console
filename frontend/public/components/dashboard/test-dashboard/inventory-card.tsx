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
import { Dropdown, DropdownItem, DropdownToggle } from '@patternfly/react-core';

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
  subscription s{
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

export const InventoryCard = () => {
  const [isOpen, setOpen] = React.useState(false);
  const [type, setType] = React.useState('WS');

  const dropdownItems = [
    <DropdownItem
      key="WS"
      onClick={() => {
        setType('WS');
        setOpen(false);
      }}
    >
      WS
    </DropdownItem>,
    <DropdownItem
      key="HTTP"
      onClick={() => {
        setType('HTTP');
        setOpen(false);
      }}
    >
      HTTP
    </DropdownItem>,
    <DropdownItem
      key="REST"
      onClick={() => {
        setType('REST');
        setOpen(false);
      }}
    >
      REST
    </DropdownItem>,
  ];

  return (
    <DashboardCard data-test-id="inventory-card">
      <DashboardCardHeader>
        <DashboardCardTitle>Cluster Inventory</DashboardCardTitle>
        <Dropdown
          toggle={
            <DropdownToggle id="toggle-id" onToggle={setOpen}>
              {type}
            </DropdownToggle>
          }
          isOpen={isOpen}
          dropdownItems={dropdownItems}
        />
      </DashboardCardHeader>
      <DashboardCardBody>
        {type === 'WS' && (
          <GQLInventoryItem mapper={getPodStatusGroups} model={PodModel} query={podsSQ} />
        )}
        {type === 'HTTP' && (
          <GQLHTTPInventoryItem mapper={getPodStatusGroups} model={PodModel} query={podsHTTPQ} />
        )}
        {type === 'REST' && <FirehoseInventoryItem mapper={getPodStatusGroups} model={PodModel} />}
      </DashboardCardBody>
    </DashboardCard>
  );
};
