import { K8sResourceKind, resourceURL } from '@console/internal/module/k8s';
import { setFlag, handleError, featureFinished } from '@console/internal/actions/features';
import { ActionFeatureFlagDetector } from '@console/plugin-sdk';
import { SubscriptionModel } from '@console/operator-lifecycle-manager';
import { OCSServiceModel } from './models';
import { OCS_INDEPENDENT_CR_NAME, CEPH_STORAGE_NAMESPACE } from './constants';
import { fetchURL } from '@console/internal/components/graphql/client';

export const OCS_INDEPENDENT_FLAG = 'OCS_INDEPENDENT';

const isIndependent = (data: K8sResourceKind): boolean =>
  data.spec?.externalStorage?.enable ?? false;

export const detectIndependentMode: ActionFeatureFlagDetector = (dispatch) =>
  fetchURL(
    resourceURL(OCSServiceModel, { ns: CEPH_STORAGE_NAMESPACE, name: OCS_INDEPENDENT_CR_NAME }),
  ).then(
    (res) => {
      featureFinished();
      dispatch(setFlag(OCS_INDEPENDENT_FLAG, isIndependent(res.data.urlFetch)));
    },
    (gqlError) => {
      featureFinished();
      const err = gqlError.graphQLErrors[0].extensions;
      err?.response?.status === 404
        ? dispatch(setFlag(OCS_INDEPENDENT_FLAG, false))
        : handleError(err, OCS_INDEPENDENT_FLAG, dispatch, detectIndependentMode);
    },
  );

export const OCS_VERSION_4_5_FLAG = 'OCS_VERSION_4_5_FLAG';

export const isOCS45AndAboveVersion = (subscription: K8sResourceKind): boolean => {
  const version = subscription?.status?.currentCSV;
  return version && version.includes('ocs-operator.v4') && version.split('.')[2] >= 5;
};

export const detectOCSVersion45AndAbove: ActionFeatureFlagDetector = (dispatch) =>
  fetchURL(
    resourceURL(SubscriptionModel, { ns: CEPH_STORAGE_NAMESPACE, name: 'ocs-subscription' }),
  ).then(
    (res) => {
      featureFinished();
      dispatch(setFlag(OCS_VERSION_4_5_FLAG, isOCS45AndAboveVersion(res.data.urlFetch)));
    },
    (gqlError) => {
      featureFinished();
      const err = gqlError.graphQLErrors[0].extensions;
      err?.response?.status === 404
        ? dispatch(setFlag(OCS_VERSION_4_5_FLAG, false))
        : handleError(err, OCS_VERSION_4_5_FLAG, dispatch, detectOCSVersion45AndAbove);
    },
  );
