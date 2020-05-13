import * as React from 'react';
import * as classNames from 'classnames';
import { modelFor, referenceFor } from '@console/internal/module/k8s/k8s-models';
import { useAccessReview } from '@console/internal/components/utils/rbac';
import { Edge, observer, WithSourceDragProps, WithTargetDragProps } from '@console/topology';
import { getTopologyResourceObject } from '@console/dev-console/src/components/topology/topology-utils';
import { BaseEdge } from '@console/dev-console/src/components/topology/components';
import './EventSourceLink.scss';

type EventSourceLinkProps = {
  element: Edge;
  dragging: boolean;
} & WithSourceDragProps &
  WithTargetDragProps;

const EventSourceLink: React.FC<EventSourceLinkProps> = ({
  element,
  targetDragRef,
  children,
  ...others
}) => {
  const resourceObj = getTopologyResourceObject(element.getSource().getData());
  const resourceModel = modelFor(referenceFor(resourceObj));
  const editAccess = useAccessReview({
    group: resourceModel.apiGroup,
    verb: 'update',
    resource: resourceModel.plural,
    name: resourceObj.metadata.name,
    namespace: resourceObj.metadata.namespace,
  });
  const markerPoint = element.getEndPoint();
  const edgeClasses = classNames('odc-event-source-link', { 'odc-m-editable': editAccess });
  return (
    <BaseEdge className={edgeClasses} element={element} {...others}>
      <circle
        className="topology-connector-arrow"
        ref={editAccess ? targetDragRef : null}
        cx={markerPoint.x}
        cy={markerPoint.y}
        r={6}
      />
    </BaseEdge>
  );
};

export default observer(EventSourceLink);
