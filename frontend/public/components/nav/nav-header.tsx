import * as React from 'react';
import { connect } from 'react-redux';
import { Dropdown, DropdownItem, DropdownToggle, Title } from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';
import { Perspective, useExtensions, isPerspective } from '@console/plugin-sdk';
import { RootState } from '../../redux-types';
import { getFlagsObject, FlagsObject } from '../../components/utils/connect-flags';
import { getActivePerspective } from '../../reducers/ui-selectors';
import * as UIActions from '../../actions/ui';
import { history } from '../utils';

type StateProps = {
  activePerspective: string;
  setActivePerspective?: (id: string) => void;
  flags: FlagsObject;
};

export type NavHeaderProps = {
  onPerspectiveSelected: () => void;
};

const NavHeader_: React.FC<NavHeaderProps & StateProps> = ({
  setActivePerspective,
  onPerspectiveSelected,
  activePerspective,
  flags,
}) => {
  const [isPerspectiveDropdownOpen, setPerspectiveDropdownOpen] = React.useState(false);
  const perspectives = useExtensions<Perspective>(isPerspective);

  const togglePerspectiveOpen = React.useCallback(() => {
    setPerspectiveDropdownOpen(!isPerspectiveDropdownOpen);
  }, [isPerspectiveDropdownOpen]);

  const onPerspectiveSelect = React.useCallback(
    (event: React.MouseEvent<HTMLLinkElement>, perspective: Perspective): void => {
      event.preventDefault();
      if (perspective.properties.id !== activePerspective) {
        setActivePerspective(perspective.properties.id);
        history.push(perspective.properties.getLandingPageURL(flags));
      }

      setPerspectiveDropdownOpen(false);
      onPerspectiveSelected && onPerspectiveSelected();
    },
    [activePerspective, flags, onPerspectiveSelected, setActivePerspective],
  );

  const renderToggle = React.useCallback(
    (icon: React.ReactNode, name: string) => (
      <DropdownToggle
        isOpen={isPerspectiveDropdownOpen}
        onToggle={togglePerspectiveOpen}
        iconComponent={CaretDownIcon}
        data-test-id="perspective-switcher-toggle"
      >
        <Title size="md">
          <span className="oc-nav-header__icon">{icon}</span>
          {name}
        </Title>
      </DropdownToggle>
    ),
    [isPerspectiveDropdownOpen, togglePerspectiveOpen],
  );

  const perspectiveItems = React.useMemo(
    () =>
      perspectives.map((nextPerspective: Perspective) => (
        <DropdownItem
          key={nextPerspective.properties.id}
          onClick={(event: React.MouseEvent<HTMLLinkElement>) =>
            onPerspectiveSelect(event, nextPerspective)
          }
          isHovered={nextPerspective.properties.id === activePerspective}
          component="button"
        >
          <Title size="md">
            <span className="oc-nav-header__icon">{nextPerspective.properties.icon}</span>
            {nextPerspective.properties.name}
          </Title>
        </DropdownItem>
      )),
    [activePerspective, onPerspectiveSelect, perspectives],
  );

  const { icon, name } = React.useMemo(
    () => perspectives.find((p) => p.properties.id === activePerspective).properties,
    [activePerspective, perspectives],
  );

  return (
    <div className="oc-nav-header">
      <Dropdown
        isOpen={isPerspectiveDropdownOpen}
        toggle={renderToggle(icon, name)}
        dropdownItems={perspectiveItems}
        data-test-id="perspective-switcher-menu"
      />
    </div>
  );
};

const mapStateToProps = (state: RootState): StateProps => ({
  activePerspective: getActivePerspective(state),
  flags: getFlagsObject(state),
});

export default connect<StateProps, {}, NavHeaderProps, RootState>(
  mapStateToProps,
  { setActivePerspective: UIActions.setActivePerspective },
  null,
  {
    areStatesEqual: (next, prev) =>
      next.FLAGS === prev.FLAGS && getActivePerspective(next) === getActivePerspective(prev),
  },
)(NavHeader_);
