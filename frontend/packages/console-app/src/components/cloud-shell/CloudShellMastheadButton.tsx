import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { useFlag } from '@console/shared/src/hooks/flag';
import { RootState } from '@console/internal/redux-types';
import { TerminalIcon } from '@patternfly/react-icons';
import { isCloudShellExpanded } from '../../redux/reducers/cloud-shell-reducer';
import { Button, ToolbarItem, Tooltip, TooltipPosition } from '@patternfly/react-core';
import { FLAG_DEVWORKSPACE } from '../../consts';
import { toggleCloudShellExpanded } from '../../redux/actions/cloud-shell-actions';
import cloudShellConfirmationModal from './cloudShellConfirmationModal';

type DispatchProps = {
  onClick: () => void;
};

type StateProps = {
  open?: boolean;
};

type Props = StateProps & DispatchProps;

const ClouldShellMastheadButton: React.FC<Props> = ({ onClick, open }) => {
  const devWorkspaceFlag = useFlag(FLAG_DEVWORKSPACE);
  const toggleTerminal = () => {
    if (open) {
      return cloudShellConfirmationModal(onClick);
    }
    return onClick();
  };

  if (!devWorkspaceFlag) {
    return null;
  }

  return (
    <ToolbarItem>
      <Tooltip
        content={open ? 'Close command line terminal' : 'Open command line terminal'}
        position={TooltipPosition.bottom}
      >
        <Button
          variant="plain"
          aria-label="Command line terminal"
          onClick={toggleTerminal}
          className={open ? 'pf-m-selected' : undefined}
        >
          <TerminalIcon className="co-masthead-icon" />
        </Button>
      </Tooltip>
    </ToolbarItem>
  );
};

const cloudShellStateToProps = (state: RootState): StateProps => ({
  open: isCloudShellExpanded(state),
});

const cloudShellPropsToState = (dispatch: Dispatch): DispatchProps => ({
  onClick: () => dispatch(toggleCloudShellExpanded()),
});

export default connect<StateProps, DispatchProps>(
  cloudShellStateToProps,
  cloudShellPropsToState,
)(ClouldShellMastheadButton);
