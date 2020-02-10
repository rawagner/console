import * as React from 'react';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

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

export const TestQuery = () => {
  const { data, loading, error } = useQuery(TEST_INFO);
  console.log(error);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error</p>;
  return <div>loaded</div>;
};
