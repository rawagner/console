

import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { WebSocketLink } from 'apollo-link-ws';
import { HttpLink } from 'apollo-link-http';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';

const wsLink = new WebSocketLink({
    uri: `ws://localhost:9000${window.SERVER_FLAGS.graphQLPublicURL}`,
    options: {
      reconnect: true,
    },
  });
  
  const httpLink = new HttpLink({
    uri: window.SERVER_FLAGS.graphQLPublicURL,
  });
  
  const link = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    },
    wsLink,
    httpLink,
  );

export default new ApolloClient({ link, cache: new InMemoryCache() });
