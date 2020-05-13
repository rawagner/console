import * as React from 'react';
import { safeLoad } from 'js-yaml';
import { CreateYAMLProps } from '@console/internal/components/create-yaml';
import { ErrorPage404 } from '@console/internal/components/error';
import { connectToPlural } from '@console/internal/kinds';
import { K8sResourceKind } from '@console/internal/module/k8s/types';
import { getNamespace, getName } from '@console/shared/src/selectors/common';
import { NET_ATTACH_DEF_HEADER_LABEL } from '../../constants';
import { NetworkAttachmentDefinitionsYAMLTemplates } from '../../models/templates';
import { NetworkAttachmentDefinitionModel } from '../../models';
import { LoadingBox } from '@console/internal/components/utils/status-box';
import { AsyncComponent } from '@console/internal/components/utils/async';
import { resourcePathFromModel } from '@console/internal/components/utils/resource-link';

const CreateNetAttachDefYAMLConnected = connectToPlural(
  ({ match, kindsInFlight, kindObj }: CreateYAMLProps) => {
    if (!kindObj) {
      if (kindsInFlight) {
        return <LoadingBox />;
      }
      return <ErrorPage404 />;
    }

    const template = NetworkAttachmentDefinitionsYAMLTemplates.getIn(['default']);
    const obj = safeLoad(template);
    obj.kind = kindObj.kind;
    obj.metadata = obj.metadata || {};
    obj.metadata.namespace = match.params.ns || 'default';

    const netAttachDefTemplatePath = (o: K8sResourceKind) =>
      resourcePathFromModel(NetworkAttachmentDefinitionModel, getName(o), getNamespace(o));
    const DroppableEditYAML = () =>
      import('@console/internal/components/droppable-edit-yaml').then((c) => c.DroppableEditYAML);

    return (
      <AsyncComponent
        loader={DroppableEditYAML}
        obj={obj}
        create
        kind={kindObj.kind}
        resourceObjPath={netAttachDefTemplatePath}
        header={NET_ATTACH_DEF_HEADER_LABEL}
      />
    );
  },
);

export default (props: any) => (
  <CreateNetAttachDefYAMLConnected
    {...(props as any)}
    plural={NetworkAttachmentDefinitionModel.plural}
  />
);
