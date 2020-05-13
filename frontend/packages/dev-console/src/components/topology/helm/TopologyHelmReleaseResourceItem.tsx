import * as React from 'react';
import { ResourceLink } from '@console/internal/components/utils/resource-link';
import { K8sResourceKind } from '@console/internal/module/k8s/types';
import { referenceFor } from '@console/internal/module/k8s/k8s-models';

type TopologyHelmReleaseResourceItemProps = {
  item: K8sResourceKind;
};

const TopologyHelmReleaseResourceItem: React.FC<TopologyHelmReleaseResourceItemProps> = ({
  item,
}) => {
  const {
    metadata: { name, namespace },
  } = item;
  const kind = referenceFor(item);

  return (
    <li className="list-group-item container-fluid">
      <div className="row">
        <span className="col-xs-12">
          <ResourceLink kind={kind} name={name} namespace={namespace} />
        </span>
      </div>
    </li>
  );
};

export default TopologyHelmReleaseResourceItem;
