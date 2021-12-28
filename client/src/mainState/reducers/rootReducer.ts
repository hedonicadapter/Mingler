import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import settingsReducer from '../features/settingsSlice';

export default function createRootReducer(history: History): any {
  return combineReducers({
    router: connectRouter(history),
    settings: settingsReducer,
  });
}
