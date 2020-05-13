import * as React from 'react';
import { useK8sWatchResource } from '@console/internal/components/utils/k8s-watch-hook';
import { BareMetalHostKind } from '../../types';
import { BareMetalHostModel } from '../../models';
import { createBasicLookup } from '@console/shared/src/utils/utils';
import { getNodeMachineName } from '@console/shared/src/selectors/node';
import { getHostMachineName } from '../../selectors';
import BareMetalHostDisks from '../baremetal-hosts/BareMetalHostDisks';
import { NodeKind } from '@console/internal/module/k8s/types';
import { referenceForModel } from '@console/internal/module/k8s/k8s';
import { PageComponentProps } from '@console/internal/components/utils/horizontal-nav';

const bareMetalHosts = {
  kind: referenceForModel(BareMetalHostModel),
  namespaced: true,
  isList: true,
};

const DisksPage: React.FC<PageComponentProps<NodeKind>> = ({ obj }) => {
  const [hosts, loaded, loadError] = useK8sWatchResource<BareMetalHostKind[]>(bareMetalHosts);
  let host: BareMetalHostKind;
  if (loaded) {
    const hostsByMachineName = createBasicLookup(hosts, getHostMachineName);
    host = hostsByMachineName[getNodeMachineName(obj)];
  }
  return <BareMetalHostDisks obj={host} loadError={loadError} />;
};

export default DisksPage;
