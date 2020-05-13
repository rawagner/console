import * as React from 'react';
import { DetailsPage, DetailsPageProps } from '@console/internal/components/factory/details';
import TriggerTemplateDetails from './detail-page-tabs/TriggerTemplateDetails';
import { navFactory, viewYamlComponent } from '@console/internal/components/utils/horizontal-nav';
import { Kebab } from '@console/internal/components/utils/kebab';

const TriggerTemplatePage: React.FC<DetailsPageProps> = (props) => (
  <DetailsPage
    {...props}
    menuActions={Kebab.factory.common}
    pages={[navFactory.details(TriggerTemplateDetails), navFactory.editYaml(viewYamlComponent)]}
  />
);

export default TriggerTemplatePage;
