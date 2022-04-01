import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import settingsReducer from '../features/settingsSlice';

export default function createRootReducer(
  history: History,
  scope: string = 'main'
): any {
  if (scope === 'main') {
    return combineReducers({ settings: settingsReducer });
  }

  if (scope === 'renderer') {
    return combineReducers({
      router: connectRouter(history),
      settings: settingsReducer,
    });
  }
}
