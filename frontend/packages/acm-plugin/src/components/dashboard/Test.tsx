import * as React from 'react';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';

const cache = new InMemoryCache();
const link = new HttpLink({
  uri: `${window.SERVER_FLAGS.mcmSearchBaseURL}`,
});

const client = new ApolloClient({
  cache,
  link,
});

const SEARCH_TEST = gql`
query searchSchema {
  searchSchema
}
`;

const TEST_INFO = gql`
  query getOverview {
    overview {
      clusters {
        metadata {
          name
          namespace
          labels
          uid
          __typename
        }
        capacity {
          cpu
          memory
          nodes
          storage
          __typename
        }
        usage {
          cpu
          memory
          pods
          storage
          __typename
        }
        consoleURL
        status
        __typename
      }
      applications {
        metadata {
          name
          namespace
          __typename
        }
        raw
        selector
        __typename
      }
      compliances {
        metadata {
          name
          namespace
          __typename
        }
        raw
        __typename
      }
      pods {
        metadata {
          name
          namespace
          __typename
        }
        cluster {
          metadata {
            name
            __typename
          }
          __typename
        }
        status
        __typename
      }
      timestamp
      __typename
    }
  }
`;

const getStatus = ({ loading, error, data }, type) => {
  if (loading) {
    return 'loading';
  } 
  if (error) {
    return 'error';
  }
  console.log(`-----${type}----`);
  console.log(data);
  return 'Loaded, see log for response data';
}

export const TestQuery = () => {
  const searchQuery = useQuery(SEARCH_TEST, {client});
  const mcmQuery = useQuery(TEST_INFO);
  return (
    <div>
      <div>MCM API: {getStatus(mcmQuery, 'MCM_API')}</div>
      <div>SEARCH API: {getStatus(searchQuery, 'SEARCH_API')}</div>
    </div>
  )
};
