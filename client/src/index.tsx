import { getInitialStateRenderer } from 'electron-redux';
import React from 'react';
import { render } from 'react-dom';
import { Provider, ReactReduxContext } from 'react-redux';
import App from './App';
import configureStore from './mainState/newStore';
import { createBrowserHistory, createHashHistory } from 'history';

const initialState = getInitialStateRenderer();
const history = createHashHistory();
const store = configureStore(history, initialState, 'renderer');

render(
  <Provider store={store} context={ReactReduxContext}>
    <App history={history} context={ReactReduxContext} />
  </Provider>,
  document.getElementById('root')
);
