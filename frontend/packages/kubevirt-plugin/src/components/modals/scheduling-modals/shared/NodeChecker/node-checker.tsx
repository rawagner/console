import * as React from 'react';
import {
  Alert,
  Popover,
  PopoverPosition,
  Text,
  TextVariants,
  Button,
} from '@patternfly/react-core';
import { NodeKind } from '@console/internal/module/k8s/types';
import { getName } from '@console/shared/src/selectors/common';
import {
  SCHEDULING_NODES_MATCH_TEXT,
  SCHEDULING_NO_NODES_MATCH_TEXT,
  SCHEDULING_NODES_MATCH_BUTTON_TEXT,
  SCHEDULING_NO_NODES_MATCH_BUTTON_TEXT,
} from '../consts';
import './node-checker.scss';
import { pluralize } from '@console/internal/components/utils/details-page';
import { ExternalLink } from '@console/internal/components/utils/link';
import { ResourceLink, resourcePath } from '@console/internal/components/utils/resource-link';

export const NodeChecker: React.FC<NodeCheckerProps> = ({ qualifiedNodes }) => {
  const size = qualifiedNodes.length;
  const buttonText = pluralize(size, 'Node');
  return (
    <Alert
      className="kv-node-checker"
      variant={size > 0 ? 'success' : 'warning'}
      isInline
      title={size > 0 ? SCHEDULING_NODES_MATCH_TEXT(size) : SCHEDULING_NO_NODES_MATCH_TEXT}
    >
      <Popover
        headerContent={<div>{buttonText} found</div>}
        position={PopoverPosition.right}
        className="kv-node-checker__popover"
        bodyContent={qualifiedNodes.map((node) => (
          <ExternalLink
            key={getName(node)}
            href={resourcePath('Node', getName(node))}
            text={<ResourceLink linkTo={false} kind="Node" name={getName(node)} />}
          />
        ))}
      >
        <Button isInline isDisabled={size === 0} variant="link">
          <Text component={TextVariants.h4}>
            {size > 0
              ? SCHEDULING_NODES_MATCH_BUTTON_TEXT(size)
              : SCHEDULING_NO_NODES_MATCH_BUTTON_TEXT}
          </Text>
        </Button>
      </Popover>
    </Alert>
  );
};

type NodeCheckerProps = {
  qualifiedNodes: NodeKind[];
};
