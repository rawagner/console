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
  ListPageCreateProps,
  UseK8sModel,
  K8sCreate,
  AppHistory,
  K8sPatch,
  K8sKill,
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
export const ListPageCreate: React.FC<ListPageCreateProps> = MockImpl;
export const TableRow: React.FC<TableRowProps> = MockImpl;
export const TableData: React.FC<TableDataProps> = MockImpl;
export const DetailsPage: React.FC<DetailsPageProps> = MockImpl;
export const k8sCreate: K8sCreate = MockImpl;
export const k8sPatch: K8sPatch = MockImpl;
export const k8sKill: K8sKill = MockImpl;
export const useK8sModel: UseK8sModel = MockImpl;
export const history: AppHistory = undefined;
