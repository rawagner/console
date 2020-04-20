import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { WebSocketLink } from 'apollo-link-ws';
import gql from 'graphql-tag';
import { split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { getMainDefinition } from 'apollo-utilities';

const link = new WebSocketLink({
  uri: `ws://localhost:9000${window.SERVER_FLAGS.graphQLPublicURL}`,
  options: {
    reconnect: true,
  },
});

const client = new ApolloClient({ link, cache: new InMemoryCache() });

export default client;

const urlQuery = gql(`query q($url: String){ urlFetch(url: $url)}`);
export const fetchURL = (url) => client.query({ query: urlQuery, variables: { url } });

const httpLink = new HttpLink({
  uri: `${window.SERVER_FLAGS.graphQLPublicURL}`,
});

const linkSplit = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  link,
  httpLink,
);

export const httpClient = new ApolloClient({ link: linkSplit, cache: new InMemoryCache() });
