import * as React from 'react';
import { navFactory } from '@console/internal/components/utils';
import { DetailsPage } from '@console/internal/components/factory';
import { K8sResourceKindReference } from '@console/internal/module/k8s';
import { TemplateModel } from '@console/internal/models';
import { VMDisksFirehose } from '../vm-disks';
import { VMNics } from '../vm-nics';
import { VMTemplateDetails } from './vm-template-details';
import { match as routerMatch } from 'react-router';
import { menuActionsCreator } from './menu-actions';

export const breadcrumbsForVMTemplatePage = (match: VMTemplateMatch) => () => [
  {
    name: 'Virtualization',
    path: `/k8s/ns/${match.params.ns || 'default'}/virtualization`,
  },
  {
    name: 'Virtual Machine Templates',
    path: `/k8s/ns/${match.params.ns || 'default'}/virtualization/templates`,
  },
  { name: `${match.params.name} Details`, path: `${match.url}` },
];

export const VMTemplateDetailsPage: React.FC<VMTemplateDetailsPageProps> = (props) => {
  const nicsPage = {
    href: 'nics',
    name: 'Network Interfaces',
    component: VMNics,
  };

  const disksPage = {
    href: 'disks',
    name: 'Disks',
    component: VMDisksFirehose,
  };

  const pages = [navFactory.details(VMTemplateDetails), navFactory.editYaml(), nicsPage, disksPage];

  return (
    <DetailsPage
      {...props}
      kind={TemplateModel.kind}
      kindObj={TemplateModel}
      name={props.match.params.name}
      namespace={props.match.params.ns}
      menuActions={menuActionsCreator()}
      pages={pages}
      breadcrumbsFor={breadcrumbsForVMTemplatePage(props.match)}
    />
  );
};

type VMTemplateMatch = routerMatch<{ ns?: string; name?: string }>;

type VMTemplateDetailsPageProps = {
  name: string;
  namespace: string;
  kind: K8sResourceKindReference;
  match: VMTemplateMatch;
};
