import * as React from 'react';
import { ListPage } from '@console/internal/components/factory/list-page';
import { referenceForModel } from '@console/internal/module/k8s/k8s';
import { ServiceModel } from '../../models';
import ServiceList from './ServiceList';

export interface ServicesPageProps {
  namespace: string;
}

const ServicesPage: React.FC<React.ComponentProps<typeof ListPage>> = (props) => (
  <ListPage
    {...props}
    canCreate
    kind={referenceForModel(ServiceModel)}
    ListComponent={ServiceList}
  />
);

export default ServicesPage;
