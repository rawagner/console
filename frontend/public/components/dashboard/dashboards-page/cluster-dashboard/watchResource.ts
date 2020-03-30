import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelectorCreator, defaultMemoize } from 'reselect';

import { watchGQL, stopWatchGQL } from '../../../../actions/k8s';
import { RootState } from '../../../../redux';
import client from '../../../graphql/client';

export const useWatchResource = (listQuery, query, queryVariables, listQueryVariables) => {
  const dispatch = useDispatch();
  React.useEffect(() => {
    console.log('start');
    dispatch(watchGQL(client, query, listQuery, queryVariables, listQueryVariables));
    return () => {
      console.log('stop');
      stopWatchGQL(query);
    }
  }, [listQuery, query, queryVariables, listQueryVariables, dispatch]);

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
