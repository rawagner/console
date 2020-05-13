import * as React from 'react';
import { ClusterServiceBrokerPage } from './cluster-service-broker';
import { ClusterServiceClassPage } from './cluster-service-class';
import { PageHeading } from './utils/headings';
import { HorizontalNav } from './utils/horizontal-nav';

const pages = [
  {
    href: '',
    name: 'Service Brokers',
    component: ClusterServiceBrokerPage,
  },
  {
    href: 'serviceclasses',
    name: 'Service Classes',
    component: ClusterServiceClassPage,
  },
];

export const BrokerManagementPage: React.SFC<BrokerManagementPageProps> = ({ match }) => (
  <>
    <PageHeading detail={true} title="Broker Management" />
    <HorizontalNav pages={pages} match={match} noStatusBox={true} />
  </>
);

export type BrokerManagementPageProps = {
  match: any;
};
