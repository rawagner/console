import {
  K8sResourceCommon,
  K8sResourceKindReference,
  Selector,
  AccessReviewResourceAttributes,
  K8sVerb,
  FirehoseResource,
  GroupVersionKind,
} from '../extensions/console-types';

import { TableGridBreakpoint, OnSelect, SortByDirection, ICell } from '@patternfly/react-table';
import { match } from 'react-router-dom';
import { History } from 'history';

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

export type KebabOption = {
  hidden?: boolean;
  label?: React.ReactNode;
  labelKey?: string;
  labelKind?: { [key: string]: string | string[] };
  href?: string;
  callback?: () => any;
  accessReview?: AccessReviewResourceAttributes;
  isDisabled?: boolean;
  tooltip?: string;
  // a `/` separated string where each segment denotes a new sub menu entry
  // Eg. `Menu 1/Menu 2/Menu 3`
  path?: string;
  pathKey?: string;
  icon?: React.ReactNode;
};

export type K8sKind = {
  abbr: string;
  kind: string;
  label: string;
  labelKey?: string;
  labelPlural: string;
  labelPluralKey?: string;
  plural: string;
  propagationPolicy?: 'Foreground' | 'Background';

  id?: string;
  crd?: boolean;
  apiVersion: string;
  apiGroup?: string;
  namespaced?: boolean;
  selector?: Selector;
  labels?: { [key: string]: string };
  annotations?: { [key: string]: string };
  verbs?: K8sVerb[];
  shortNames?: string[];
  badge?: any;
  color?: string;

  // Legacy option for supporing plural names in URL paths when `crd: true`.
  // This should not be set for new models, but is needed to avoid breaking
  // existing links as we transition to using the API group in URL paths.
  legacyPluralURL?: boolean;
};

export type KebabOptionsCreator = (
  kindObj: K8sKind,
  data: K8sResourceCommon,
  extraResources?: { [prop: string]: K8sResourceCommon | K8sResourceCommon[] },
  customData?: any,
) => KebabOption[];

export type PageComponentProps<R extends K8sResourceCommon = K8sResourceCommon> = {
  filters?: any;
  selected?: any;
  match?: any;
  obj?: R;
  params?: any;
  customData?: any;
  showTitle?: boolean;
  fieldSelector?: string;
};

export type Page = {
  href?: string;
  path?: string;
  name?: string;
  nameKey?: string;
  component?: React.ComponentType<PageComponentProps>;
  pageData?: any;
};

export type DetailsPageProps = {
  match: match<any>;
  title?: string | JSX.Element;
  titleFunc?: (obj: K8sResourceCommon) => string | JSX.Element;
  menuActions?: Function[] | KebabOptionsCreator; // FIXME should be "KebabAction[] |" refactor pipeline-actions.tsx, etc.
  buttonActions?: any[];
  pages?: Page[];
  pagesFor?: (obj: K8sResourceCommon) => Page[];
  kind: K8sResourceKindReference;
  kindObj?: K8sKind;
  label?: string;
  name?: string;
  namespace?: string;
  resources?: FirehoseResource[];
  breadcrumbsFor?: (obj: K8sResourceCommon) => { name: string; path: string }[];
  customData?: any;
  badge?: React.ReactNode;
  icon?: React.ComponentType<{ obj: K8sResourceCommon }>;
  getResourceStatus?: (resource: K8sResourceCommon) => string;
  children?: React.ReactNode;
  customKind?: string;
};

export type CreateWithPermissionsProps = {
  createAccessReview?: {
    model: K8sKind;
    namespace?: string;
  };
};

export type ListPageCreateProps = CreateWithPermissionsProps & {
  groupVersionKind: GroupVersionKind;
  namespace?: string;
};

export type UseK8sModel = (groupVersionKind: GroupVersionKind) => [K8sKind, boolean];

export type K8sCreate = <D = any, R = any>(kind: K8sKind, data: D) => Promise<R>;
export type K8sPatch = (kind, resource, data) => Promise<any>;
export type K8sKill = (kind, resource, data?: any) => Promise<any>;

export type AppHistory = History & { pushPath: History['push'] };
