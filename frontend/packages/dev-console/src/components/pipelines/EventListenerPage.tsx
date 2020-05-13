import * as React from 'react';
import { DetailsPage, DetailsPageProps } from '@console/internal/components/factory/details';
import { navFactory, viewYamlComponent } from '@console/internal/components/utils/horizontal-nav';
import { Kebab } from '@console/internal/components/utils/kebab';
import EventListenerDetails from './detail-page-tabs/EventListenerDetails';

const EventListenerPage: React.FC<DetailsPageProps> = (props) => (
  <DetailsPage
    {...props}
    menuActions={Kebab.factory.common}
    pages={[navFactory.details(EventListenerDetails), navFactory.editYaml(viewYamlComponent)]}
  />
);

export default EventListenerPage;
