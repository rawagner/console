import * as React from 'react';
import { ServiceInstancesPage } from './service-instance';
import { ServiceBindingsPage } from './service-binding';
import { PageHeading } from './utils/headings';
import { HorizontalNav } from './utils/horizontal-nav';

const pages = [
  {
    href: '',
    name: 'Service Instances',
    component: ServiceInstancesPage,
  },
  {
    href: 'servicebindings',
    name: 'Service Bindings',
    component: ServiceBindingsPage,
  },
];

export const ProvisionedServicesPage: React.SFC<ProvisionedServicesPageProps> = ({ match }) => (
  <>
    <PageHeading detail={true} title="Provisioned Services" />
    <HorizontalNav pages={pages} match={match} noStatusBox={true} />
  </>
);

export type ProvisionedServicesPageProps = {
  match: any;
};
