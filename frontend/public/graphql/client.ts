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
import { getImpersonateHeaders, coFetch } from '../co-fetch';

const isIOS = !!window.navigator.userAgent.match(/(iPhone|iPad)/);
let wssErrors = 0;

class GraphQLReadyCallback {
  private callback: VoidFunction;
  private ready: boolean;
  private wasCalled: boolean;

  setReady() {
    this.ready = true;
    if (!this.wasCalled && this.callback) {
      this.wasCalled = true;
      this.callback();
    }
  }

  setCallback(cb: VoidFunction) {
    if (!isIOS) {
      this.wasCalled = true;
      cb();
    } else {
      this.callback = cb;
      if (this.ready && !this.wasCalled) {
        this.wasCalled = true;
        this.callback();
      }
    }
  }
}

export const graphQLReady = new GraphQLReadyCallback();

export const subsClient = new SubscriptionClient(
  `${location.protocol === 'https:' ? 'wss://' : 'ws://'}${location.host}${
    window.SERVER_FLAGS.graphqlBaseURL
  }`,
  {
    reconnect: true,
    connectionParams: getImpersonateHeaders,
    reconnectionAttempts: isIOS ? 5 : undefined,
    connectionCallback: () => {
      graphQLReady.setReady();
      wssErrors = 0;
    },
  },
);

subsClient.onError(() => {
  if (isIOS) {
    wssErrors++;
    if (wssErrors > 4) {
      graphQLReady.setReady();
    }
  }
});

const httpLink = new HttpLink({
  uri: window.SERVER_FLAGS.graphqlBaseURL,
  fetch: coFetch,
});

const wsLink = new WebSocketLink(subsClient);

const link = split(
  () => wssErrors > 4, // iOS does not allow wss with self signed certificate
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
    return Promise.reject({ response: err.graphQLErrors[0]?.extensions });
  }
};

export const fetchK8s = <R extends K8sResourceCommon = K8sResourceCommon>(
  kind: K8sKind,
  name?: string,
  ns?: string,
  path?: string,
  queryParams?: { [key: string]: string },
): Promise<R> => fetchURL<R>(getK8sResourcePath(kind, { ns, name, path, queryParams }));
