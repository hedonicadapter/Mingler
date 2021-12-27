import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter, Route } from 'react-router-dom';
import App from './App';
import ConnectChatClientPopup from './components/ConnectChatClientPopup';
import FindFriendsPopUp from './components/FindFriendsPopUp';
import { configuredStore } from './mainState/store';

const store = configuredStore();

render(
  <Provider store={store}>
    <HashRouter>
      <Route path="/" exact component={App} />
      <Route path="/findfriends" exact component={FindFriendsPopUp} />
      <Route
        path="/connectChatClient"
        exact
        component={ConnectChatClientPopup}
      />
    </HashRouter>
  </Provider>,
  document.getElementById('root')
);
