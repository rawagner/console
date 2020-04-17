import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { WebSocketLink } from 'apollo-link-ws';

const link = new WebSocketLink({
  uri: `ws://localhost:9000${window.SERVER_FLAGS.graphQLPublicURL}`,
  options: {
    reconnect: true,
  },
});

export default new ApolloClient({ link, cache: new InMemoryCache() });
