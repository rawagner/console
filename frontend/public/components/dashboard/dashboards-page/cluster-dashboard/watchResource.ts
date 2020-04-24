import * as React from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore: FIXME missing exports due to out-of-sync @types/react-redux version
import { useDispatch, useSelector } from 'react-redux';
import { createSelectorCreator, defaultMemoize } from 'reselect';

import { watchGQL, stopWatchGQL, fetchGQL } from '../../../../actions/k8s';
import { RootState } from '../../../../redux';

export const useWatchResource = (query, queryVariables, perf) => {
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(watchGQL(query, queryVariables, null, perf));
    return () => {
      dispatch(stopWatchGQL(query));
    };
  }, [query, queryVariables, dispatch, perf]);

  const id = JSON.stringify(query);

  const resourceK8sSelectorCreator = React.useMemo(
    () =>
      createSelectorCreator(
        //specifying createSelectorCreator<ImmutableMap<string, K8sKind>> throws type error
        defaultMemoize as any,
        (oldResource, newResource) => oldResource === newResource,
      ),
    [],
  );

  const resourceK8sSelector = React.useMemo(
    () =>
      resourceK8sSelectorCreator(
        (state: RootState) => state.k8s,
        (k8s) => k8s.get(id),
      ),
    [id, resourceK8sSelectorCreator],
  );

  const resourceK8s = useSelector(resourceK8sSelector);

  return React.useMemo(() => {
    const simpleResource = resourceK8s ? resourceK8s.toJSON() : resourceK8s;
    return simpleResource
      ? [
          simpleResource.loaded ? Object.values(simpleResource.data) : [],
          simpleResource.loaded,
          simpleResource.loadError,
        ]
      : [[], false, null];
  }, [resourceK8s]);
};

export const useWatchResourceHttp = (query) => {
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(fetchGQL(query));
    return () => {
      dispatch(stopWatchGQL(query));
    };
  }, [dispatch, query]);

  const id = JSON.stringify(query);

  const resourceK8sSelectorCreator = React.useMemo(
    () =>
      createSelectorCreator(
        //specifying createSelectorCreator<ImmutableMap<string, K8sKind>> throws type error
        defaultMemoize as any,
        (oldResource, newResource) => oldResource === newResource,
      ),
    [],
  );

  const resourceK8sSelector = React.useMemo(
    () =>
      resourceK8sSelectorCreator(
        (state: RootState) => state.k8s,
        (k8s) => k8s.get(id),
      ),
    [id, resourceK8sSelectorCreator],
  );

  const resourceK8s = useSelector(resourceK8sSelector);

  return React.useMemo(() => {
    const simpleResource = resourceK8s ? resourceK8s.toJSON() : resourceK8s;
    return simpleResource
      ? [
          simpleResource.loaded ? Object.values(simpleResource.data) : [],
          simpleResource.loaded,
          simpleResource.loadError,
        ]
      : [[], false, null];
  }, [resourceK8s]);
};
