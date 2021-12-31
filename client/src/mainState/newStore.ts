import { createStore, applyMiddleware, compose } from 'redux';
// import { persistState } from 'redux-devtools';
import thunk from 'redux-thunk';
import promise from 'redux-promise';
import { createLogger } from 'redux-logger';
import { createHashHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import createRootReducer from './reducers/rootReducer';

import {
  forwardToMain,
  forwardToRenderer,
  triggerAlias,
  replayActionMain,
  replayActionRenderer,
} from 'electron-redux';
import DevTools from '../../renderer/main/components/DevTools';

/**
 * @param  {Object} initialState
 * @param  {String} [scope='main|renderer']
 * @return {Object} store
 */
export default function configureStore(initialState?: any, scope = 'main') {
  const logger = createLogger({
    level: scope === 'main' ? undefined : 'info',
    collapsed: true,
  });
  const history = scope === 'renderer' ? createHashHistory() : null;
  const router = scope === 'renderer' ? routerMiddleware(history) : null;

  let middleware = [router];

  if (!process.env.NODE_ENV) {
    middleware.push(logger);
  }
  if (scope === 'renderer') {
    middleware = [forwardToMain, router];
  }

  if (scope === 'main') {
    middleware = [triggerAlias, forwardToRenderer];
  }

  const enhanced = [applyMiddleware(...middleware)];

  if (/*! process.env.NODE_ENV && */ scope === 'renderer') {
    // enhanced.push(DevTools.instrument());
    // enhanced.push(
    //   persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
    // );
  }

  const rootReducer = createRootReducer(history, scope);
  const enhancer = compose(...enhanced);
  const store = initialState
    ? createStore(rootReducer, initialState, enhancer)
    : createStore(rootReducer, enhancer);

  if (!process.env.NODE_ENV && module.hot) {
    module.hot.accept('./reducers/rootReducer', () => {
      store.replaceReducer(require('./educers/rootReducer').default);
    });
  }

  if (scope === 'main') {
    replayActionMain(store);
    store.subscribe(() => {});
  } else {
    replayActionRenderer(store);
    store.subscribe(() => {});
  }

  return store;
}
