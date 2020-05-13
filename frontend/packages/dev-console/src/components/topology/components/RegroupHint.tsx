import * as React from 'react';
import { InfoCircleIcon } from '@patternfly/react-icons';
import './RegroupHint.scss';
import ShortcutTable from '@console/shared/src/components/shortcuts/ShortcutTable';
import Shortcut from '@console/shared/src/components/shortcuts/Shortcut';

const RegroupHint: React.FC = () => (
  <div className="odc-regroup-hint">
    <InfoCircleIcon className="odc-regroup-hint__icon" />
    <span className="odc-regroup-hint__text">
      <ShortcutTable>
        <Shortcut shift drag>
          Edit application grouping
        </Shortcut>
      </ShortcutTable>
    </span>
  </div>
);

export { RegroupHint };
