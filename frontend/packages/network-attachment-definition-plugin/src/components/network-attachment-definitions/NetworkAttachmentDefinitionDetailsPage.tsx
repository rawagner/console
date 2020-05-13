import * as React from 'react';
import { K8sResourceKindReference } from '@console/internal/module/k8s/types';
import { referenceForModel } from '@console/internal/module/k8s/k8s';
import { DetailsPage } from '@console/internal/components/factory/details';
import { NetworkAttachmentDefinitionModel } from '../..';
import { NetworkAttachmentDefinitionDetails } from './NetworkAttachmentDefinitionDetails';
import { Kebab } from '@console/internal/components/utils/kebab';
import { navFactory } from '@console/internal/components/utils/horizontal-nav';

const { common } = Kebab.factory;
const menuActions = [
  ...Kebab.getExtensionsActionsForKind(NetworkAttachmentDefinitionModel),
  ...common,
];

export const NetworkAttachmentDefinitionsDetailsPage: React.FC<NetworkAttachmentDefinitionsDetailPageProps> = (
  props,
) => {
  const overviewPage = {
    href: '', // default landing page
    name: 'Details',
    component: NetworkAttachmentDefinitionDetails,
  };

  const pages = [overviewPage, navFactory.editYaml()];

  return (
    <DetailsPage
      {...props}
      pages={pages}
      kind={referenceForModel(NetworkAttachmentDefinitionModel)}
      menuActions={menuActions}
    />
  );
};

type NetworkAttachmentDefinitionsDetailPageProps = {
  name: string;
  namespace: string;
  kind: K8sResourceKindReference;
  match: any;
};

export default NetworkAttachmentDefinitionsDetailsPage;
