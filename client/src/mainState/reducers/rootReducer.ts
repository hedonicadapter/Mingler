import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import settingsReducer from '../features/settingsSlice';

export default function createRootReducer(
  history: History,
  scope: string = 'main'
): any {
  let reducers =
    scope == 'renderer'
      ? {
          router: connectRouter(history),
          settings: settingsReducer,
        }
      : {
          settings: settingsReducer,
        };

  if (scope === 'renderer') {
    reducers = {
      ...reducers,
    };
  }

  return combineReducers({ ...reducers });
}
