import { Dispatch } from 'react-redux';
import * as _ from 'lodash-es';
import { ActionType as Action, action } from 'typesafe-actions';
import { FLAGS } from '@console/shared/src/constants/common';
import { GroupModel, SelfSubjectAccessReviewModel, UserModel } from '../models';
import { k8sBasePath, ClusterVersionKind, k8sCreate } from '../module/k8s';
import { receivedResources } from './k8s';
import { coFetchJSON } from '../co-fetch';
import { MonitoringRoutes } from '../reducers/monitoring';
import { setMonitoringURL } from './monitoring';
import * as plugins from '../plugins';
import { setClusterID, setCreateProjectMessage, setUser, setConsoleLinks } from './common';
import gql from 'graphql-tag';
import client from '../components/graphql/client';

export enum ActionType {
  SetFlag = 'setFlag',
  ClearSSARFlags = 'clearSSARFlags',
}

export const defaults = _.mapValues(FLAGS, (flag) =>
  flag === FLAGS.AUTH_ENABLED ? !window.SERVER_FLAGS.authDisabled : undefined,
);

export const setFlag = (flag: FLAGS | string, value: boolean) =>
  action(ActionType.SetFlag, { flag, value });

const retryFlagDetection = (dispatch, cb) => {
  setTimeout(() => cb(dispatch), 15000);
};

export const handleError = (res, flag, dispatch, cb) => {
  const status = _.get(res, 'response.status');
  if (_.includes([403, 502], status)) {
    dispatch(setFlag(flag, undefined));
  }
  if (!_.includes([401, 403, 500], status)) {
    retryFlagDetection(dispatch, cb);
  }
};

const projectListPath = `${k8sBasePath}/apis/project.openshift.io/v1/projects?limit=1`;
const detectShowOpenShiftStartGuide = (dispatch, canListNS: boolean = false) => {
  // Skip the project check if we know the user can list all namespaces. This
  // avoids potentially listing thousands of projects more than once (projects
  // dropdown and flag check). Even though we only ask for one project, the
  // projects API currently doesn't support paging.
  //
  // TODO: Consider adding a global watch for projects / namespaces, which
  // could remove the need for this flag entirely. It would also prevent us
  // from re-listing projects when switching from a namespace-scoped resource
  // to a cluster-scoped resource and back.
  if (canListNS) {
    dispatch(setFlag(FLAGS.SHOW_OPENSHIFT_START_GUIDE, false));
    return;
  }

  coFetchJSON(projectListPath).then(
    (res) => dispatch(setFlag(FLAGS.SHOW_OPENSHIFT_START_GUIDE, _.isEmpty(res.items))),
    (err) =>
      _.get(err, 'response.status') === 404
        ? dispatch(setFlag(FLAGS.SHOW_OPENSHIFT_START_GUIDE, false))
        : handleError(
            err,
            FLAGS.SHOW_OPENSHIFT_START_GUIDE,
            dispatch,
            detectShowOpenShiftStartGuide,
          ),
  );
};

// Check the user's access to some resources.
const ssarChecks = [
  {
    flag: FLAGS.CAN_GET_NS,
    resourceAttributes: { resource: 'namespaces', verb: 'get' },
  },
  {
    flag: FLAGS.CAN_LIST_NS,
    resourceAttributes: { resource: 'namespaces', verb: 'list' },
    after: detectShowOpenShiftStartGuide,
  },
  {
    flag: FLAGS.CAN_LIST_NODE,
    resourceAttributes: { resource: 'nodes', verb: 'list' },
  },
  {
    flag: FLAGS.CAN_LIST_PV,
    resourceAttributes: { resource: 'persistentvolumes', verb: 'list' },
  },
  {
    flag: FLAGS.CAN_LIST_USERS,
    resourceAttributes: {
      group: UserModel.apiGroup,
      resource: UserModel.plural,
      verb: 'list',
    },
  },
  {
    flag: FLAGS.CAN_LIST_GROUPS,
    resourceAttributes: {
      group: GroupModel.apiGroup,
      resource: GroupModel.plural,
      verb: 'list',
    },
  },
  {
    flag: FLAGS.CAN_LIST_CRD,
    resourceAttributes: {
      group: 'apiextensions.k8s.io',
      resource: 'customresourcedefinitions',
      verb: 'list',
    },
  },
  {
    // TODO: Move into OLM plugin
    flag: FLAGS.CAN_LIST_OPERATOR_GROUP,
    resourceAttributes: {
      group: 'operators.coreos.com',
      resource: 'operatorgroups',
      verb: 'list',
    },
  },
  {
    // TODO: Move into OLM plugin
    flag: FLAGS.CAN_LIST_PACKAGE_MANIFEST,
    resourceAttributes: {
      group: 'operators.coreos.com',
      resource: 'packagemanifests',
      verb: 'list',
    },
  },
  {
    flag: FLAGS.CAN_LIST_CHARGEBACK_REPORTS,
    resourceAttributes: {
      group: 'metering.openshift.io',
      resource: 'reports',
      namespace: 'openshift-metering',
      verb: 'list',
    },
  },
];

export const clearSSARFlags = () =>
  action(ActionType.ClearSSARFlags, {
    flags: ssarChecks.map((check) => check.flag),
  });

const featureActions = { setFlag };
const clearFlags = { clearSSARFlags };

export type FeatureAction = Action<
  typeof featureActions | typeof receivedResources | typeof clearFlags
>;

const openshiftPath = '/apis/apps.openshift.io/v1';
const detectOpenShift = (dispatch) =>
  coFetchJSON(`${k8sBasePath}${openshiftPath}`).then(
    (res) => dispatch(setFlag(FLAGS.OPENSHIFT, _.size(res.resources) > 0)),
    (err) =>
      _.get(err, 'response.status') === 404
        ? dispatch(setFlag(FLAGS.OPENSHIFT, false))
        : handleError(err, FLAGS.OPENSHIFT, dispatch, detectOpenShift),
  );

const clusterVersionPath = '/apis/config.openshift.io/v1/clusterversions/version';
const detectClusterVersion = (dispatch) =>
  coFetchJSON(`${k8sBasePath}${clusterVersionPath}`).then(
    (clusterVersion: ClusterVersionKind) => {
      const hasClusterVersion = !_.isEmpty(clusterVersion);
      dispatch(setFlag(FLAGS.CLUSTER_VERSION, hasClusterVersion));
      dispatch(setClusterID(clusterVersion.spec.clusterID));
    },
    (err) => {
      if (_.includes([403, 404], _.get(err, 'response.status'))) {
        dispatch(setFlag(FLAGS.CLUSTER_VERSION, false));
      } else {
        handleError(err, FLAGS.OPENSHIFT, dispatch, detectOpenShift);
      }
    },
  );

const projectRequestPath = '/apis/project.openshift.io/v1/projectrequests';
const detectCanCreateProject = (dispatch) =>
  coFetchJSON(`${k8sBasePath}${projectRequestPath}`).then(
    (res) => dispatch(setFlag(FLAGS.CAN_CREATE_PROJECT, res.status === 'Success')),
    (err) => {
      const status = _.get(err, 'response.status');
      if (status === 403) {
        dispatch(setFlag(FLAGS.CAN_CREATE_PROJECT, false));
        dispatch(setCreateProjectMessage(_.get(err, 'json.details.causes[0].message')));
      } else if (!_.includes([400, 404, 500], status)) {
        retryFlagDetection(dispatch, detectCanCreateProject);
      }
    },
  );

const loggingConfigMapPath = '/api/v1/namespaces/openshift-logging/configmaps/sharing-config';
const detectLoggingURL = (dispatch) =>
  coFetchJSON(`${k8sBasePath}${loggingConfigMapPath}`).then(
    (res) => {
      const { kibanaAppURL } = res.data;
      if (!_.isEmpty(kibanaAppURL)) {
        dispatch(setMonitoringURL(MonitoringRoutes.Kibana, kibanaAppURL));
      }
    },
    (err) => {
      if (!_.includes([401, 403, 404, 500], _.get(err, 'response.status'))) {
        setTimeout(() => detectLoggingURL(dispatch), 15000);
      }
    },
  );

const detectUserPath = '/apis/user.openshift.io/v1/users/~';
const detectUser = (dispatch) =>
  coFetchJSON(`${k8sBasePath}${detectUserPath}`).then(
    (user) => {
      dispatch(setUser(user));
    },
    (err) => {
      if (!_.includes([401, 403, 404, 500], _.get(err, 'response.status'))) {
        setTimeout(() => detectUser(dispatch), 15000);
      }
    },
  );

const detectConsoleLinksPath = '/apis/console.openshift.io/v1/consolelinks';
const detectConsoleLinks = (dispatch) =>
  coFetchJSON(`${k8sBasePath}${detectConsoleLinksPath}`).then(
    (consoleLinks) => {
      dispatch(setConsoleLinks(_.get(consoleLinks, 'items')));
    },
    (err) => {
      if (!_.includes([401, 403, 404, 500], _.get(err, 'response.status'))) {
        setTimeout(() => detectConsoleLinks(dispatch), 15000);
      }
    },
  );

const ssarCheckActions = ssarChecks.map(({ flag, resourceAttributes, after }) => {
  const req = {
    spec: { resourceAttributes },
  };
  const fn = (dispatch) => {
    return k8sCreate(SelfSubjectAccessReviewModel, req).then(
      (res) => {
        const allowed: boolean = res.status.allowed;
        dispatch(setFlag(flag, allowed));
        if (after) {
          after(dispatch, allowed);
        }
      },
      (err) => handleError(err, flag, dispatch, fn),
    );
  };
  return fn;
});

export const detectFeatures = () => (dispatch: Dispatch) =>
  [
    //detectOpenShift, //done
    //detectCanCreateProject, //done
    //detectClusterVersion, //done
    //detectUser, //done
    //detectLoggingURL, //done
    //detectConsoleLinks, //done
    //...ssarCheckActions,
    //...plugins.registry
   //   .getFeatureFlags()
   //   .filter(plugins.isActionFeatureFlag)
     // .map((ff) => ff.properties.detect),
  ].forEach((detect) => detect(dispatch));


const gqlFeatures = [
  {
    path: openshiftPath,
    action: (dispatch, res) => {
      dispatch(setFlag(FLAGS.OPENSHIFT, _.size(res.resources) > 0))
    },
    error: (dispatch, err) => dispatch(setFlag(FLAGS.OPENSHIFT, false)),
  },
  {
    path: clusterVersionPath,
    action: (dispatch, res) => {
      if (!_.isEmpty(res)) {
        dispatch(setFlag(FLAGS.CLUSTER_VERSION, true));
        dispatch(setClusterID(res.spec.clusterID));
      }
    },
    error: (dispatch, err) => dispatch(setFlag(FLAGS.CLUSTER_VERSION, false)),
  },
  {
    path: projectRequestPath,
    action: (dispatch, res) => {
      dispatch(setFlag(FLAGS.CAN_CREATE_PROJECT, res.status === 'Success'));
    },
    error: (dispatch, err) => {
      dispatch(setFlag(FLAGS.CAN_CREATE_PROJECT, false));
      dispatch(setCreateProjectMessage(_.get(err, 'json.details.causes[0].message')));
    },
  },
  {
    path: detectUserPath,
    action: (dispatch, res) => {
      dispatch(setUser(res));
    }
  },
  {
    path: loggingConfigMapPath,
    action: (dispatch, res) => {
      const { kibanaAppURL } = res.data;
      if (!_.isEmpty(kibanaAppURL)) {
        dispatch(setMonitoringURL(MonitoringRoutes.Kibana, kibanaAppURL));
      }
    }
  },
  {
    path: detectConsoleLinksPath,
    action: (dispatch, res) => {
      dispatch(setConsoleLinks(_.get(res, 'items')));
    }
  }
];

const getSsarAttr = (ssar) => {
  let attr = `resource: "${ssar.resourceAttributes.resource}", verb: "${ssar.resourceAttributes.verb}"`;
  if (ssar.resourceAttributes.group) {
    attr = `${attr}, group: "${ssar.resourceAttributes.group}"`
  }
  if (ssar.resourceAttributes.namespace) {
    attr = `${attr}, namespace: "${ssar.resourceAttributes.namespace}"`
  }
  return attr;
}

export const detectFeaturesGQL = () => (dispatch: Dispatch) => {
  const pluginFeatures = plugins.registry
    .getFeatureFlags()
    .filter(plugins.isActionFeatureFlag)
    .map(({ properties: { url, action, error } }) => ({
      path: url,
      action,
      error,
    }));
  const featuresBody = [...gqlFeatures, ...pluginFeatures].map((f, index) => `feature${index}: urlFetch(url: "${f.path}")`).join(' ');
  const ssarBody = ssarChecks.map((c, index) => `ssar${index}: selfSubjectAccessReview(${getSsarAttr(c)}){status{allowed}}`).join(' ');
  const query = gql(`
    query {
      ${featuresBody}
      ${ssarBody}
    }
  `);
  client.query({ query, errorPolicy: 'all' }).then(response => {
    Object.keys(response.data).filter(k => k.startsWith('feature')).forEach((key, index) => {
      const error = response.errors.find((e) => e.path[0] === key);
      if (error) {
        gqlFeatures[index].error && gqlFeatures[index].error(dispatch, error.extensions);
      } else {
        gqlFeatures[index].action(dispatch, response.data[key]);
      }
    Object.keys(response.data).filter(k => k.startsWith('ssar')).forEach((key, index) => {
      const error = response.errors.find((e) => e.path[0] === key);
      if (error) {
        gqlFeatures[index].error && gqlFeatures[index].error(dispatch, error.extensions);
      } else {
        const res = response.data[key];
        const allowed: boolean = res.status.allowed;
        dispatch(setFlag(ssarChecks[index].flag, allowed));
      }
    })
    //Object.values(response.data).forEach((res, index) => gqlFeatures[index].action(dispatch, res));
  })});
  /*
  try {
    const result = await client.query({ query });
    Object.values(result.data).forEach((res, index) => gqlFeatures[index].action(dispatch, res));
  } catch (err) {
    console.log(err);
  }
  */
}
