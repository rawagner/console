/* eslint-disable react-hooks/exhaustive-deps */
import { pollURL, stopPollURL } from '../../actions/poll';
import { PollState } from '../../reducers/poll';
import { useCallback, useState, useEffect, useMemo } from 'react';
import { Map as ImmutableMap } from 'immutable';
import { createSelectorCreator, defaultMemoize } from 'reselect';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { useDispatch, useSelector } from 'react-redux';
import { useDeepCompareMemoize } from '@console/shared';

import { usePoll } from './poll-hook';
import { useSafeFetch } from './safe-fetch-hook';
import { RootState } from '../../redux';

export const URL_POLL_DEFAULT_DELAY = 15000; // 15 seconds

export const useURLPoll = <R>(
  url: string,
  delay = URL_POLL_DEFAULT_DELAY,
  ...dependencies: any[]
): URLPoll<R> => {
  const [error, setError] = useState();
  const [response, setResponse] = useState<R>();
  const [loading, setLoading] = useState(true);
  const safeFetch = useSafeFetch();
  const tick = useCallback(() => {
    if (url) {
      safeFetch(url)
        .then((data) => {
          setResponse(data);
          setError(undefined);
          setLoading(false);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            setError(err);
            setLoading(false);
            // eslint-disable-next-line no-console
            console.error(`Error polling URL: ${err}`);
          }
        });
    } else {
      setLoading(false);
    }
  }, [url]);

  usePoll(tick, delay, ...dependencies);

  return [response, error, loading];
};

export const useNewURLPoll = <R>(url: string, delay = URL_POLL_DEFAULT_DELAY): URLPoll<R> => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(pollURL(url, delay));
    () => dispatch(stopPollURL(url, delay));
  }, [url, delay]);

  const pollResult = useSelector<RootState, ImmutableMap<string, R>>((state: RootState) =>
    state.poll.get(url),
  );

  return useMemo(() => {
    const data = pollResult.get('data');
    const loadError = data.get('loadError');
    return [data, loadError, !data && !loadError];
  }, [pollResult]);
};

export const useNewURLsPoll = <R>(
  initUrls: string[],
  delay = URL_POLL_DEFAULT_DELAY,
): URLPolls<R> => {
  const urls = useDeepCompareMemoize(initUrls, true);
  const dispatch = useDispatch();
  useEffect(() => {
    urls?.forEach((url) => dispatch(pollURL(url, delay)));
    () => urls?.forEach((url) => dispatch(stopPollURL(url, delay)));
  }, [urls, delay]);

  const resourceK8sSelectorCreator = useMemo(
    () =>
      createSelectorCreator(
        //specifying createSelectorCreator<ImmutableMap<string, any>> throws type error
        defaultMemoize as any,
        (oldPolls: ImmutableMap<string, any>, newPolls: ImmutableMap<string, any>) =>
          urls.every((url) => oldPolls.get(url) === newPolls.get(url)),
      ),
    [urls],
  );

  const resourceK8sSelector = useMemo(
    () =>
      resourceK8sSelectorCreator(
        (state: RootState) => state.poll,
        (poll) => poll,
      ),
    [resourceK8sSelectorCreator],
  );

  const polls = useSelector<RootState, PollState>(resourceK8sSelector);

  return useMemo(
    () =>
      urls.reduce((acc, url) => {
        const data = polls.getIn([url, 'data']);
        const loadError = polls.getIn([url, 'loadError']);
        acc[url] = [data, loadError, !data && !loadError];
        return acc;
      }, {}),
    [urls, polls],
  );
};

export type URLPoll<R> = [R, any, boolean];
export type URLPolls<R> = {
  [key: string]: URLPoll<R>;
};
