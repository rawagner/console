import { NodeModel, EdgeModel } from '@console/topology';
import { TYPE_VIRTUAL_MACHINE } from './components/const';
import {
  TopologyDataModel as DataModel,
  Group,
  TopologyDataObject,
  Node,
  Edge,
} from '@console/dev-console/src/components/topology/topology-types';
import { TopologyFilters as Filters } from '@console/dev-console/src/components/topology/filters';
import { dataObjectFromModel } from '@console/dev-console/src/components/topology/data-transforms/transform-utils';
import {
  NODE_WIDTH,
  NODE_HEIGHT,
  NODE_PADDING,
} from '@console/dev-console/src/components/topology/components';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getKubevirtGroupModel = (d: Group, model: DataModel, filters: Filters): NodeModel => {
  return null;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getKubevirtNodeModel = (d: Node, model: DataModel, filters: Filters): NodeModel => {
  if (d.type === TYPE_VIRTUAL_MACHINE) {
    const data: TopologyDataObject = model.topology[d.id] || dataObjectFromModel(d);
    const hidden = filters && !filters.display.virtualMachines;
    return {
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      id: d.id,
      type: d.type,
      label: model.topology[d.id].name,
      data,
      visible: !hidden,
      style: {
        padding: NODE_PADDING,
      },
    };
  }
  return null;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getKubevirtEdgeModel = (d: Edge, model: DataModel, filters: Filters): EdgeModel => {
  return null;
};
