import { useNewURLPoll } from '../utils/url-poll-hook';
import { getPrometheusURL, PrometheusEndpoint } from './helpers';
import { PrometheusRulesResponse } from '../monitoring/types';

export const usePrometheusRulesPoll = ({ delay, namespace }: PrometheusPollProps) => {
  const url = getPrometheusURL({
    endpoint: PrometheusEndpoint.RULES,
    namespace,
  });

  return useNewURLPoll<PrometheusRulesResponse>(url, delay);
};

type PrometheusPollProps = {
  delay?: number;
  namespace?: string;
};
