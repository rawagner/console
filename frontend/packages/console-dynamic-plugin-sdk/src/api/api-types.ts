import { K8sResourceCommon, K8sResourceKindReference, Selector } from '../extensions/console-types';

import { TableGridBreakpoint, OnSelect, SortByDirection, ICell } from '@patternfly/react-table';

export type WatchK8sResource = {
  kind: K8sResourceKindReference;
  name?: string;
  namespace?: string;
  isList?: boolean;
  selector?: Selector;
  namespaced?: boolean;
  limit?: number;
  fieldSelector?: string;
  optional?: boolean;
};

export type WatchK8sResult<R extends K8sResourceCommon | K8sResourceCommon[]> = [R, boolean, any];

export type ResourcesObject = { [key: string]: K8sResourceCommon | K8sResourceCommon[] };

export type WatchK8sResultsObject<R extends K8sResourceCommon | K8sResourceCommon[]> = {
  data: R;
  loaded: boolean;
  loadError: any;
};

export type WatchK8sResults<R extends ResourcesObject> = {
  [k in keyof R]: WatchK8sResultsObject<R[k]>;
};

export type WatchK8sResources<R extends ResourcesObject> = {
  [k in keyof R]: WatchK8sResource;
};

export type UseK8sWatchResource = <R extends K8sResourceCommon | K8sResourceCommon[]>(
  initResource: WatchK8sResource,
) => WatchK8sResult<R>;

export type UseK8sWatchResources = <R extends ResourcesObject>(
  initResources: WatchK8sResources<R>,
) => WatchK8sResults<R>;

export type TableColumn<D> = ICell & {
  title: string;
  id?: string;
  additional?: boolean;
  sort?: (data: D[], sortDirection: SortByDirection) => D[];
};

export type RowProps<D> = {
  obj: D;
  index: number;
  columns: TableColumn<D>[];
  isScrolling: boolean;
  style: object;
};

export type VirtualizedTableProps<D = any> = {
  data: D[];
  loaded: boolean;
  loadError: any;
  columns: TableColumn<D>[];
  Row: React.ComponentType<RowProps<D>>;
  NoDataEmptyMsg?: React.ComponentType<{}>;
  EmptyMsg?: React.ComponentType<{}>;
  scrollNode?: () => HTMLElement;
  onSelect?: OnSelect;
  label?: string;
  'aria-label'?: string;
  gridBreakPoint?: TableGridBreakpoint;
  activeColumns?: Set<string>;
  columnManagementID?: string;
  showNamespaceOverride?: boolean;
};

export type RowFilter<R = any> = {
  defaultSelected?: string[];
  filterGroupName: string;
  type: string;
  items: {
    [key: string]: string;
  }[];
  isMatch?: (param: R, id: string) => boolean;
  reducer?: (param: R) => React.ReactText;
  filter?: (filter: { selected: Set<string>; all: string[] }, object: R) => boolean;
};

export type ManagedColumn = {
  id?: string;
  title: string;
  additional?: boolean;
};

export type ColumnLayout = {
  id: string;
  columns: ManagedColumn[];
  selectedColumns: Set<string>;
  showNamespaceOverride?: boolean;
  type: string;
};

export type OnFilterChange = (type: string, value: string | string[]) => void;

export type ListPageFilterProps<D = any> = {
  data: D;
  loaded: boolean;
  rowFilters?: RowFilter[];
  nameFilterPlaceholder?: string;
  labelFilterPlaceholder?: string;
  textFilter?: string;
  hideNameLabelFilters?: boolean;
  hideLabelFilter?: boolean;
  columnLayout?: ColumnLayout;
  onFilterChange: OnFilterChange;
};

export type ListPageHeaderProps = {
  title: string;
  helpText?: React.ReactNode;
  badge?: React.ReactNode;
};

export type TableRowProps = {
  id: any;
  index: number;
  title?: string;
  trKey: string;
  style: object;
  className?: string;
};

export type TableDataProps = {
  className?: string;
  columnID?: string;
  columns?: Set<string>;
  id?: string;
  showNamespaceOverride?: boolean;
};
