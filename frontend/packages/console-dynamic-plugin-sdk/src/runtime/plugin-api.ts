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
  };
};
