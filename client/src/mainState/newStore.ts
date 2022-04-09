import { createStore, applyMiddleware, compose } from 'redux';
import { createLogger } from 'redux-logger';
import { routerMiddleware } from 'connected-react-router';
import createRootReducer from './reducers/rootReducer';

import {
  forwardToMain,
  forwardToRenderer,
  triggerAlias,
  replayActionMain,
  replayActionRenderer,
} from 'electron-redux';
import devtools from './devtools';

/**
 * @param  {Object} initialState
 * @param  {String} [scope='main|renderer']
 * @return {Object} store
 */
export default function configureStore(
  history?: any,
  initialState?: any,
  scope = 'main'
) {
  const excludeLoggerEnvs = ['test', 'production'];
  const shouldIncludeLogger = !excludeLoggerEnvs.includes(
    process.env.NODE_ENV || ''
  );

  const logger = createLogger({
    level: scope === 'main' ? undefined : 'info',
    collapsed: true,
  });
  const router = scope === 'renderer' ? routerMiddleware(history) : null;

  let middleware = [];

  if (shouldIncludeLogger) {
    middleware.push(logger);
  }
  if (scope === 'renderer') {
    middleware = [forwardToMain, router, ...middleware];
  }

  if (scope === 'main') {
    middleware = [triggerAlias, ...middleware, forwardToRenderer];
  }

  const enhanced = [applyMiddleware(...middleware)];

  if (/*! process.env.NODE_ENV && */ scope === 'renderer') {
    // enhanced.push(devtools.instrument());
    // enhanced.push(
    //   persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
    // );
  }

  const rootReducer = createRootReducer(history, scope);
  const enhancer = compose(...enhanced);
  const store = createStore(rootReducer, initialState, enhancer);

  if (!process.env.NODE_ENV && module.hot) {
    module.hot.accept('./reducers/rootReducer', () => {
      store.replaceReducer(createRootReducer(history, scope));
    });
  }

  if (scope === 'main') {
    replayActionMain(store);
  } else {
    replayActionRenderer(store);

    store.subscribe(() => {});
  }

  return store;
}
