import * as React from 'react';
import ShortcutTable from '@console/shared/src/components/shortcuts/ShortcutTable';
import Shortcut from '@console/shared/src/components/shortcuts/Shortcut';

const TopologyShortcuts: React.ReactElement = (
  <ShortcutTable>
    <Shortcut drag>Move</Shortcut>
    <Shortcut shift drag>
      Edit application grouping
    </Shortcut>
    <Shortcut rightClick>Access context menu</Shortcut>
    <Shortcut click>View details in side panel</Shortcut>
    <Shortcut hover>Access create connector handle</Shortcut>
  </ShortcutTable>
);

export default TopologyShortcuts;
