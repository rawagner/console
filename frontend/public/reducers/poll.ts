import * as _ from 'lodash';
import { Map as ImmutableMap, fromJS } from 'immutable';
import { PollAction, ActionType } from '../actions/poll';

type Request = {
  active: boolean;
  timeout: NodeJS.Timer;
  inFlight: boolean;
  data: any;
  error: any;
};

export type PollState = ImmutableMap<string, Request>;

export const pollReducer = (state: PollState, action: PollAction): PollState => {
  if (!state) {
    return ImmutableMap(fromJS({}));
  }
  switch (action.type) {
    case ActionType.StartWatch: {
      const activePath = [action.payload.url, 'active'];
      const active = state.getIn(activePath) || 0;
      return state.withMutations((s) => {
        s.setIn(activePath, active + 1);
        const delays = s.getIn([action.payload.url, 'delays']) || [];
        if (!delays.includes(action.payload.delay)) {
          s.setIn([action.payload.url, 'delays'], [...delays, action.payload.delay]);
        }
      });
    }
    case ActionType.UpdateWatchTimeout:
      return state.setIn([action.payload.url, 'timeout'], action.payload.timeout);
    case ActionType.UpdateWatchInFlight:
      return state.setIn([action.payload.url, 'inFlight'], action.payload.inFlight);
    case ActionType.StopWatch: {
      const active = state.getIn([action.payload.url, 'active']);
      let newState: PollState;
      if (active === 1) {
        clearTimeout(state.getIn([action.payload.url, 'timeout']));
        newState = state.remove(action.payload.url);
      } else {
        newState = state.withMutations((s) => {
          s.setIn([action.payload.url, 'active'], active - 1);
          s.setIn(
            [action.payload.url, 'delays'],
            _.without(state.getIn([action.payload.url, 'delays']), action.payload.delay),
          );
        });
      }
      return newState;
    }
    case ActionType.SetError:
      return state.setIn([action.payload.url, 'loadError'], action.payload.error);
    case ActionType.SetData:
      return state.withMutations((s) =>
        s
          .setIn([action.payload.url, 'data'], action.payload.data)
          .setIn([action.payload.url, 'loadError'], null),
      );
    default:
      return state;
  }
};
