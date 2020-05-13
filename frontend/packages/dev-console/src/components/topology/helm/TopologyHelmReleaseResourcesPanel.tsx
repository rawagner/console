import * as React from 'react';
import { K8sResourceKind } from '@console/internal/module/k8s/types';
import { modelFor, referenceFor } from '@console/internal/module/k8s/k8s-models';
import { SidebarSectionHeading } from '@console/internal/components/utils/headings';
import TopologyHelmReleaseResourceList from './TopologyHelmReleaseResourceList';

type TopologyHelmReleaseResourcesPanelProps = {
  manifestResources: K8sResourceKind[];
};

const TopologyHelmReleaseResourcesPanel: React.SFC<TopologyHelmReleaseResourcesPanelProps> = ({
  manifestResources,
}) => {
  const kinds = manifestResources
    .reduce((resourceKinds, resource) => {
      const kind = referenceFor(resource);
      if (!resourceKinds.includes(kind)) {
        resourceKinds.push(kind);
      }
      return resourceKinds;
    }, [])
    .sort((a, b) => a.localeCompare(b));

  const resourceLists = kinds.reduce((lists, kind) => {
    const model = modelFor(kind);
    const resources = manifestResources.filter((resource) => resource.kind === model.kind);
    if (resources.length) {
      lists.push(
        <div key={model.kind}>
          <SidebarSectionHeading text={model.labelPlural} />
          <TopologyHelmReleaseResourceList resources={resources} />
        </div>,
      );
    }
    return lists;
  }, []);

  return <div className="overview__sidebar-pane-body">{resourceLists}</div>;
};

export default TopologyHelmReleaseResourcesPanel;
