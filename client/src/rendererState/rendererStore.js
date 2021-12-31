import {
  forwardToMain,
  replayActionRenderer,
  getInitialStateRenderer,
} from 'electron-redux';
import settingsReducer from '../features/settingsSlice';

const todoApp = combineReducers({
  settings: settingsReducer,
});
const initialState = getInitialStateRenderer();

const store = createStore(
  todoApp,
  initialState,
  applyMiddleware(
    forwardToMain // IMPORTANT! This goes first
  )
);

replayActionRenderer(store);
