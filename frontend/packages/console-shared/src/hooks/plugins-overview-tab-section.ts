import * as React from 'react';
import { AsyncComponent, AsyncComponentProps } from '@console/internal/components/utils/async';
import { OverviewTabSection, isOverviewTabSection } from '@console/plugin-sdk/src/typings';
import { useExtensions } from '@console/plugin-sdk/src/useExtensions';
import { OverviewItem } from '../types/resource';

export const getResourceTabSectionComp = (t: OverviewTabSection): React.FC<AsyncComponentProps> => (
  props: AsyncComponentProps,
) => React.createElement(AsyncComponent, { ...props, loader: t.properties.loader });

export const usePluginsOverviewTabSection = (
  item: OverviewItem,
): { Component: React.FC<AsyncComponentProps>; key: string }[] => {
  const tabSections = useExtensions(isOverviewTabSection);
  return React.useMemo(
    () =>
      tabSections
        .filter((section) => item[section.properties.key])
        .map((section: OverviewTabSection) => ({
          Component: getResourceTabSectionComp(section),
          key: section.properties.key,
        })),
    // `item` is complex object but we only use the presence of keys as a dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(Object.keys(item).sort())],
  );
};
