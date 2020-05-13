import * as React from 'react';
import * as _ from 'lodash';
import { referenceForModel } from '@console/internal/module/k8s/k8s';
import { K8sResourceKind, PodKind } from '@console/internal/module/k8s/types';
import { PodModel } from '@console/internal/models';
import { PodsOverview } from '@console/internal/components/overview/pods-overview';
import { ServiceModel } from '../../models';
import { PodControllerOverviewItem } from '@console/shared/src/types/pod';
import { ExternalLink } from '@console/internal/components/utils/link';
import { SidebarSectionHeading } from '@console/internal/components/utils/headings';
import { ResourceLink } from '@console/internal/components/utils/resource-link';

export type EventSinkServicesOverviewListProps = {
  obj: K8sResourceKind;
  pods?: PodKind[];
  current?: PodControllerOverviewItem;
};

const EventSinkServicesOverviewList: React.FC<EventSinkServicesOverviewListProps> = ({
  obj,
  pods,
  current,
}) => {
  const {
    kind: resKind,
    apiVersion,
    metadata: { name, namespace },
  } = obj;
  const sink = _.get(obj, 'spec.sink.ref') || _.get(obj, 'spec.sink');
  const sinkUri = obj?.status?.sinkUri;
  const deploymentData = current?.obj?.metadata?.ownerReferences?.[0];
  const apiGroup = apiVersion.split('/')[0];
  const linkUrl = `/search/ns/${namespace}?kind=${PodModel.kind}&q=${encodeURIComponent(
    `${apiGroup}/${_.lowerFirst(resKind)}=${name}`,
  )}`;
  return (
    <>
      <SidebarSectionHeading text="Knative Services" />
      {sink && sink.kind === ServiceModel.kind ? (
        <ul className="list-group">
          <li className="list-group-item">
            <ResourceLink
              kind={referenceForModel(ServiceModel)}
              name={sink.name}
              namespace={namespace}
            />
            {sinkUri && (
              <>
                <span className="text-muted">Sink URI: </span>
                <ExternalLink
                  href={sinkUri}
                  additionalClassName="co-external-link--block"
                  text={sinkUri}
                />
              </>
            )}
          </li>
        </ul>
      ) : (
        <span className="text-muted">No services found for this resource.</span>
      )}
      {pods?.length > 0 && <PodsOverview pods={pods} obj={obj} allPodsLink={linkUrl} />}
      {deploymentData?.name && (
        <>
          <SidebarSectionHeading text="Deployment" />
          <ul className="list-group">
            <li className="list-group-item">
              <ResourceLink
                kind={deploymentData.kind}
                name={deploymentData.name}
                namespace={namespace}
              />
            </li>
          </ul>
        </>
      )}
    </>
  );
};

export default EventSinkServicesOverviewList;
