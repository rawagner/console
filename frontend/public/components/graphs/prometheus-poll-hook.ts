import * as React from 'react';
import { useNewURLPoll, useNewURLsPoll } from '../utils/url-poll-hook';
import { getPrometheusURL, PrometheusEndpoint } from './helpers';
import { DEFAULT_PROMETHEUS_SAMPLES, DEFAULT_PROMETHEUS_TIMESPAN, PrometheusResponse } from '.';
import { useDeepCompareMemoize } from '@console/shared';

export const usePrometheusPoll = ({
  delay,
  endpoint,
  endTime,
  namespace,
  query,
  samples = DEFAULT_PROMETHEUS_SAMPLES,
  timeout,
  timespan = DEFAULT_PROMETHEUS_TIMESPAN,
}: PrometheusPollProps) => {
  const url = getPrometheusURL({ endpoint, endTime, namespace, query, samples, timeout, timespan });

  return useNewURLPoll<PrometheusResponse>(url, delay);
};

export const usePrometheusPolls = ({
  delay,
  endpoint,
  endTime,
  namespace,
  initQueries,
  samples = DEFAULT_PROMETHEUS_SAMPLES,
  timeout,
  timespan = DEFAULT_PROMETHEUS_TIMESPAN,
}: PrometheusPollsProps) => {
  const queries = useDeepCompareMemoize(initQueries);
  const urls = React.useMemo(
    () =>
      queries.map((query) =>
        getPrometheusURL({ endpoint, endTime, namespace, query, samples, timeout, timespan }),
      ),
    [endTime, endpoint, namespace, queries, samples, timeout, timespan],
  );

  return useNewURLsPoll<PrometheusResponse>(urls, delay);
};

type PrometheusPollsProps = {
  delay?: number;
  endpoint: PrometheusEndpoint;
  endTime?: number;
  namespace?: string;
  initQueries: string[];
  samples?: number;
  timeout?: string;
  timespan?: number;
};

type PrometheusPollProps = {
  delay?: number;
  endpoint: PrometheusEndpoint;
  endTime?: number;
  namespace?: string;
  query: string;
  samples?: number;
  timeout?: string;
  timespan?: number;
};
