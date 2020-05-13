import * as React from 'react';
import { modelFor, referenceFor } from '@console/internal/module/k8s/k8s-models';
import {
  GraphElement,
  ComponentFactory as TopologyComponentFactory,
  withDragNode,
  withDndDrop,
  withSelection,
  Node,
} from '@console/topology';
import { ModifyApplication } from '@console/dev-console/src/actions/modify-application';
import { vmMenuActions } from '../../components/vms/menu-actions';
import { VmNode } from './nodes/VmNode';
import { TYPE_VIRTUAL_MACHINE } from './const';
import { VMNodeData } from '../types';
import { kebabOptionsToMenu, KebabOption } from '@console/internal/components/utils/kebab';
import { TopologyDataObject } from '@console/dev-console/src/components/topology/topology-types';
import { getTopologyResourceObject } from '@console/dev-console/src/components/topology/topology-utils';
import {
  AbstractSBRComponentFactory,
  createMenuItems,
  withEditReviewAccess,
  nodeDragSourceSpec,
  withContextMenu,
  NodeComponentProps,
  nodeDropTargetSpec,
} from '@console/dev-console/src/components/topology/components';

export const vmActions = (vm: TopologyDataObject<VMNodeData>): KebabOption[] => {
  const contextMenuResource = getTopologyResourceObject(vm);
  if (!contextMenuResource) {
    return null;
  }
  const {
    data: { vmi, vmStatusBundle },
  } = vm;

  const model = modelFor(referenceFor(contextMenuResource));
  return [
    ModifyApplication(model, contextMenuResource),
    ...vmMenuActions.map((action) => {
      return action(model, contextMenuResource, {
        vmi,
        vmStatusBundle,
      });
    }),
  ];
};

export const vmContextMenu = (element: Node) => {
  return createMenuItems(kebabOptionsToMenu(vmActions(element.getData())));
};

class KubevirtComponentFactory extends AbstractSBRComponentFactory {
  getFactory = (): TopologyComponentFactory => {
    return (kind, type): React.ComponentType<{ element: GraphElement }> | undefined => {
      switch (type) {
        case TYPE_VIRTUAL_MACHINE:
          return this.withAddResourceConnector()(
            withDndDrop<
              any,
              any,
              { droppable?: boolean; hover?: boolean; canDrop?: boolean },
              NodeComponentProps
            >(nodeDropTargetSpec)(
              withEditReviewAccess('patch')(
                withDragNode(nodeDragSourceSpec(type))(
                  withSelection(false, true)(withContextMenu(vmContextMenu)(VmNode)),
                ),
              ),
            ),
          );
        default:
          return undefined;
      }
    };
  };
}

export { KubevirtComponentFactory };
