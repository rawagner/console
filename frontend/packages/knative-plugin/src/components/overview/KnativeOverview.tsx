import * as React from 'react';
import PodRing from '@console/shared/src/components/pod/PodRing';
import { OverviewItem } from '@console/shared/src/types/resource';
import { ResourceSummary } from '@console/internal/components/utils/details-page';
import { RevisionModel } from '../../models';

type KnativeOverviewProps = {
  item?: OverviewItem;
};

const KnativeOverview: React.FC<KnativeOverviewProps> = ({ item }) => {
  const { obj, current } = item;
  return (
    <div className="overview__sidebar-pane-body resource-overview__body">
      {obj.kind === RevisionModel.kind && (
        <div className="resource-overview__pod-counts">
          <PodRing
            pods={current ? current.pods : []}
            obj={obj}
            rc={current && current.obj}
            resourceKind={RevisionModel}
            path="/spec/replicas"
          />
        </div>
      )}
      <div className="resource-overview__summary">
        <ResourceSummary resource={obj} />
      </div>
    </div>
  );
};

export default KnativeOverview;
