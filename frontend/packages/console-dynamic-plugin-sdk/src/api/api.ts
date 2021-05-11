import * as React from 'react';
import {
  UseK8sWatchResource,
  UseK8sWatchResources,
  VirtualizedTableProps,
  ListPageHeaderProps,
  ListPageFilterProps,
  TableRowProps,
  TableDataProps,
  DetailsPageProps,
} from './api-types';

export * from './api-types';

const MockImpl = () => {
  throw new Error('You need to configure webpack externals to use this function at runtime.');
};

export const useK8sWatchResource: UseK8sWatchResource = MockImpl;
export const useK8sWatchResources: UseK8sWatchResources = MockImpl;
export const VirtualizedTable: React.FC<VirtualizedTableProps> = MockImpl;
export const ListPageHeader: React.FC<ListPageHeaderProps> = MockImpl;
export const ListPageBody: React.FC = MockImpl;
export const ListPageFilter: React.FC<ListPageFilterProps> = MockImpl;
export const TableRow: React.FC<TableRowProps> = MockImpl;
export const TableData: React.FC<TableDataProps> = MockImpl;
export const DetailsPage: React.FC<DetailsPageProps> = MockImpl;
