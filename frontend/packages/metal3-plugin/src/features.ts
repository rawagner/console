import { resourceURL } from '@console/internal/module/k8s';
import { InfrastructureModel } from '@console/internal/models';
import { getInfrastructurePlatform } from '@console/shared/src/selectors/infrastructure';
import { setFlag, handleError, featureFinished } from '@console/internal/actions/features';
import { ActionFeatureFlagDetector } from '@console/plugin-sdk';
import { fetchURL } from '@console/internal/components/graphql/client';

export const BAREMETAL_FLAG = 'BAREMETAL';

export const detectBaremetalPlatform: ActionFeatureFlagDetector = (dispatch) =>
  fetchURL(resourceURL(InfrastructureModel, { name: 'cluster' })).then(
    (res) => {
      featureFinished();
      dispatch(
        setFlag(BAREMETAL_FLAG, getInfrastructurePlatform(res.data.urlFetch) === 'BareMetal'),
      );
    },
    (gqlError) => {
      featureFinished();
      const err = gqlError.graphQLErrors[0].extensions;
      err?.response?.status === 404
        ? dispatch(setFlag(BAREMETAL_FLAG, false))
        : handleError(err, BAREMETAL_FLAG, dispatch, detectBaremetalPlatform);
    },
  );
