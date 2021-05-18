/* eslint-disable global-require, @typescript-eslint/no-require-imports */

export const exposePluginAPI = () => {
  window.api = {
    useK8sWatchResource: require('@console/internal/components/utils/k8s-watch-hook')
      .useK8sWatchResource,
    useK8sWatchResources: require('@console/internal/components/utils/k8s-watch-hook')
      .useK8sWatchResources,
    VirtualizedTable: require('@console/internal/components/factory/Table/VirtualizedTable')
      .default,
    ListPageHeader: require('@console/internal/components/factory/ListPage/ListPageHeader').default,
    ListPageBody: require('@console/internal/components/factory/ListPage/ListPageBody').default,
    ListPageFilter: require('@console/internal/components/factory/ListPage/ListPageFilter').default,
    ListPageCreate: require('@console/internal/components/factory/ListPage/ListPageCreate').default,
    TableRow: require('@console/internal/components/factory/table').TableRow,
    TableData: require('@console/internal/components/factory/table').TableData,
    DetailsPage: require('@console/internal/components/factory/details').DetailsPage,
    useK8sModel: require('@console/shared/src/hooks/useK8sModel').useK8sModel,
    k8sCreate: require('@console/internal/module/k8s/resource').k8sCreate,
  };
};
