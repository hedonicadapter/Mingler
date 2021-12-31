import { getInitialStateRenderer } from 'electron-redux';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter, Route } from 'react-router-dom';
import App from './App';
import ConnectChatClientPopup from './components/ConnectChatClientPopup';
import FindFriendsPopUp from './components/FindFriendsPopUp';
import SettingsWindow from './components/settingsWindow';
import configureStore from './mainState/newStore';
// import { configureStore } from './mainState/';

const initialState = getInitialStateRenderer();
const store = configureStore(initialState, 'renderer');

render(
  <Provider store={store}>
    <HashRouter>
      <Route path="/" exact component={App} />
      <Route path="/findfriends" exact component={FindFriendsPopUp} />
      <Route path="/settings" exact component={SettingsWindow} />
      <Route
        path="/connectChatClient"
        exact
        component={ConnectChatClientPopup}
      />
    </HashRouter>
  </Provider>,
  document.getElementById('root')
);
