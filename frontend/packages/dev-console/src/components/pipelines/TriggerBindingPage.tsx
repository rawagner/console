import * as React from 'react';
import { DetailsPage, DetailsPageProps } from '@console/internal/components/factory/details';
import { navFactory, viewYamlComponent } from '@console/internal/components/utils/horizontal-nav';
import { Kebab } from '@console/internal/components/utils/kebab';
import TriggerBindingDetails from './detail-page-tabs/TriggerBindingDetails';

const TriggerBindingPage: React.FC<DetailsPageProps> = (props) => (
  <DetailsPage
    {...props}
    menuActions={Kebab.factory.common}
    pages={[navFactory.details(TriggerBindingDetails), navFactory.editYaml(viewYamlComponent)]}
  />
);

export default TriggerBindingPage;
