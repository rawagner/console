import * as React from 'react';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';
import { NavExpandable } from '@patternfly/react-core';

import { NavItem, Perspective, isNavItem, isPerspective } from '@console/plugin-sdk/src/typings';
import { withExtensions } from '@console/plugin-sdk/src/withExtensions';
import { RootState, FeatureState } from '../../redux-types';
import { flagPending } from '../utils/connect-flags';
import { stripNS, createLink } from './items';
import { getActivePerspective } from '../../reducers/ui-selectors';
import { stripBasePath } from '../utils/link';

const navSectionStateToProps = (
  state: RootState,
  { required }: NavSectionProps,
): NavSectionStateProps => {
  const flags = state.FLAGS;
  const canRender = required ? flags.get(required) : true;

  return {
    flags,
    canRender,
    activeNamespace: state.UI.get('activeNamespace'),
    location: state.UI.get('location'),
    perspective: getActivePerspective(state),
  };
};

const mergePluginChild = (
  Children: React.ReactElement[],
  pluginChild: React.ReactElement,
  mergeBefore?: string,
) => {
  const index = Children.findIndex((c) => c.props.name === mergeBefore);
  if (index >= 0) {
    Children.splice(index, 0, pluginChild);
  } else {
    Children.push(pluginChild);
  }
};

export const NavSection = connect(navSectionStateToProps)(
  withExtensions<NavSectionExtensionProps>({
    navItemExtensions: isNavItem,
    perspectiveExtensions: isPerspective,
  })(
    class NavSection extends React.Component<Props, NavSectionState> {
      public state: NavSectionState;

      constructor(props) {
        super(props);
        this.state = { isOpen: false, activeChild: null };

        const activeChild = this.getActiveChild();
        if (activeChild) {
          this.state.activeChild = activeChild;
          this.state.isOpen = true;
        }
      }

      shouldComponentUpdate(nextProps, nextState) {
        const { isOpen } = this.state;

        if (isOpen !== nextProps.isOpen) {
          return true;
        }

        if (!isOpen && !nextState.isOpen) {
          return false;
        }

        return nextProps.location !== this.props.location || nextProps.flags !== this.props.flags;
      }

      getActiveChild() {
        const { activeNamespace, location } = this.props;
        const children = this.getChildren();

        if (!children) {
          return stripBasePath(location).startsWith(this.props.activePath);
        }

        const resourcePath = location ? stripNS(location) : '';

        //current bug? - we should be checking if children is a single item or .filter is undefined
        return (children as any[])
          .filter((c) => {
            if (!c) {
              return false;
            }
            if (c.props.startsWith) {
              const active = c.type.startsWith(resourcePath, c.props.startsWith);
              if (active || !c.props.activePath) {
                return active;
              }
            }
            return c.type.isActive && c.type.isActive(c.props, resourcePath, activeNamespace);
          })
          .map((c) => `${c.props.id}-${c.props.name}`)[0];
      }

      componentDidUpdate(prevProps, prevState) {
        const activeChild = this.getActiveChild();

        if (prevState.activeChild !== activeChild) {
          const state: Partial<NavSectionState> = { activeChild };
          if (activeChild && !prevState.activeChild) {
            state.isOpen = true;
          }
          this.setState(state as NavSectionState);
        }
      }

      toggle = (e, expandState) => {
        this.setState({ isOpen: expandState });
      };

      getNavItemExtensions = (perspective: string, section: string) => {
        const { navItemExtensions, perspectiveExtensions } = this.props;

        const defaultPerspective = _.find(perspectiveExtensions, (p) => p.properties.default);
        const isDefaultPerspective =
          defaultPerspective && perspective === defaultPerspective.properties.id;

        return navItemExtensions.filter(
          (item) =>
            // check if the item is contributed to the current perspective,
            // or if no perspective specified, are we in the default perspective
            (item.properties.perspective === perspective ||
              (!item.properties.perspective && isDefaultPerspective)) &&
            item.properties.section === section,
        );
      };

      mapChild = (c: React.ReactElement) => {
        if (!c) {
          return null;
        }

        const { activeChild } = this.state;
        const { flags, activeNamespace } = this.props;
        const { name, required, disallowed, id } = c.props;

        const requiredArray = required ? _.castArray(required) : [];
        const requirementMissing = _.some(
          requiredArray,
          (flag) => flag && (flagPending(flags.get(flag)) || !flags.get(flag)),
        );
        if (requirementMissing) {
          return null;
        }
        if (disallowed && (flagPending(flags.get(disallowed)) || flags.get(disallowed))) {
          return null;
        }

        return React.cloneElement(c, {
          key: name,
          isActive: `${id}-${name}` === activeChild,
          activeNamespace,
          flags,
        });
      };

      getChildren() {
        const { title, children, perspective } = this.props;
        const Children = React.Children.map(children, this.mapChild) || [];

        this.getNavItemExtensions(perspective, title).forEach((item) => {
          const pluginChild = this.mapChild(createLink(item));
          if (pluginChild) {
            mergePluginChild(Children, pluginChild, item.properties.mergeBefore);
          }
        });

        return Children;
      }

      render() {
        if (!this.props.canRender) {
          return null;
        }

        const { title } = this.props;
        const { isOpen, activeChild } = this.state;
        const isActive = !!activeChild;
        const children = this.getChildren();

        return children.length > 0 ? (
          <NavExpandable
            title={title}
            isActive={isActive}
            isExpanded={isOpen}
            onExpand={this.toggle}
          >
            {children}
          </NavExpandable>
        ) : null;
      }
    },
  ),
);

export type NavSectionTitle =
  | 'Administration'
  | 'Builds'
  | 'Compute'
  | 'Home'
  | 'Monitoring'
  | 'Networking'
  | 'Operators'
  | 'Service Catalog'
  | 'Storage'
  | 'Workloads';

type NavSectionStateProps = {
  flags?: FeatureState;
  canRender?: boolean;
  activeNamespace?: string;
  activePath?: string;
  location?: string;
  perspective: string;
};

type NavSectionExtensionProps = {
  navItemExtensions: NavItem[];
  perspectiveExtensions: Perspective[];
};

type NavSectionProps = {
  title: NavSectionTitle | string;
  required?: string;
};

type Props = NavSectionProps & NavSectionStateProps & NavSectionExtensionProps;

type NavSectionState = {
  isOpen: boolean;
  activeChild: React.ReactNode;
};
