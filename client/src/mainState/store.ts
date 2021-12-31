import { configureStore, getDefaultMiddleware, Action } from '@reduxjs/toolkit';
import { createHashHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import { createLogger } from 'redux-logger';
import { ThunkAction } from 'redux-thunk';
import createRootReducer from './reducers/rootReducer';
// import { persistState } from 'redux-devtools';

import {
  forwardToRenderer,
  forwardToMain,
  triggerAlias,
  replayActionMain,
  replayActionRenderer,
} from 'electron-redux';

export const history = createHashHistory();
const rootReducer = createRootReducer(history);
export type RootState = ReturnType<typeof rootReducer>;

const excludeLoggerEnvs = ['test', 'production'];
const shouldIncludeLogger = !excludeLoggerEnvs.includes(
  process.env.NODE_ENV || ''
);

export const configuredStore = (
  initialState?: RootState,
  scope: string = 'main'
) => {
  const router = routerMiddleware(history);
  const middleware = [router];

  if (shouldIncludeLogger) {
    const logger = createLogger({
      level: scope === 'main' ? undefined : 'info',
      collapsed: true,
    });
    middleware.push(logger);
  }

  const rendererStore = (getDefaultMiddleware: any) => [
    forwardToMain,
    ...middleware,
    ...getDefaultMiddleware(),
    // DevTools.instrument(),
    // persistState(window.location.href.match(
    //   /[?&]debug_session=([^&]+)\b/
    // ))
  ];
  const mainStore = (getDefaultMiddleware: any) => [
    triggerAlias,
    ...middleware,
    ...getDefaultMiddleware(),
    forwardToRenderer,
  ];

  const store = configureStore({
    reducer: rootReducer,
    middleware: scope === 'renderer' ? rendererStore : mainStore,
    preloadedState: initialState,
  });

  if (process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept(
      './reducers/rootReducer',
      // eslint-disable-next-line global-require
      () => store.replaceReducer(require('./reducers/rootReducer').default)
    );
  }

  if (scope === 'main') {
    replayActionMain(store);
  } else {
    replayActionRenderer(store);
  }

  return store;
};
// export type Store = ReturnType<typeof configuredStore>;
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;
// export const store = configuredStore();
