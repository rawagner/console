import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { WebSocketLink } from 'apollo-link-ws';
import { split } from 'apollo-link';

import { getK8sResourcePath } from '../module/k8s/resource';
import { K8sKind, K8sResourceCommon } from '../module/k8s/types';
import { URLQuery } from './client.gql';
import { URLQueryType, URLQueryVariables } from '../../@types/gql/schema';
import { getImpersonateHeaders } from '../co-fetch';

const isIOS = !!window.navigator.userAgent.match(/(iPhone|iPad)/);
const IOS_WSS_ERRORS = "ios-wss-errors";

class ReadyCallback {
  callback;
  ready;
  wasCalled;
  setReady() {
    this.ready = true;
    if (!this.wasCalled && this.callback) {
      this.wasCalled = true;
      this.callback();
    }
  }
  setCallback(cb) {
    this.callback = cb;
    if (this.ready && !this.wasCalled) {
      this.wasCalled = true;
      this.callback();
    }
  }
}

export const ready = new ReadyCallback();

const useHTTP = () => parseInt(localStorage.getItem(IOS_WSS_ERRORS)) > 4;

export const subsClient = new SubscriptionClient(
  `${location.protocol === 'https:' ? 'wss://' : 'wss://'}${location.host}${
    window.SERVER_FLAGS.graphqlBaseURL
  }`,
  {
    reconnect: true,
    connectionParams: getImpersonateHeaders,
    reconnectionAttempts: !isIOS ? useHTTP() ? 2 : 5 : undefined,
    connectionCallback: () => {
      ready.setReady();
      localStorage.removeItem(IOS_WSS_ERRORS)
    },
  },
);

subsClient.onError((err) => {
  if (!isIOS && !useHTTP()) {
    let wssErrors = parseInt(localStorage.getItem(IOS_WSS_ERRORS)) || 0;
    wssErrors++;
    localStorage.setItem(IOS_WSS_ERRORS, `${wssErrors}`);
    if (wssErrors > 4) {
      ready.setReady();
      // location.reload();
    }
  }
});

const httpLink = new HttpLink({
  uri: window.SERVER_FLAGS.graphqlBaseURL,
});

const wsLink = new WebSocketLink(subsClient);

const link = split(
  useHTTP, // iOS does not allow wss with self signed certificate
  httpLink,
  wsLink,
);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'network-only',
    },
    mutate: {
      fetchPolicy: 'network-only',
    },
    watchQuery: {
      fetchPolicy: 'network-only',
    },
  },
});

export default client;

export const fetchURL = async <R = any>(url: string): Promise<R> => {
  try {
    const response = await client.query<URLQueryType, URLQueryVariables>({
      query: URLQuery,
      variables: { url },
    });
    return JSON.parse(response.data.fetchURL);
  } catch (err) {
    return Promise.reject({ response: err.graphQLErrors[0].extensions });
  }
};

export const fetchK8s = <R extends K8sResourceCommon = K8sResourceCommon>(
  kind: K8sKind,
  name?: string,
  ns?: string,
  path?: string,
  queryParams?: { [key: string]: string },
): Promise<R> => fetchURL<R>(getK8sResourcePath(kind, { ns, name, path, queryParams }));
