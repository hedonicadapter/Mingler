import React from 'react';
import { render } from 'react-dom';
import { HashRouter, Route } from 'react-router-dom';
import App from './App';
import FindFriendsPopUp from './components/FindFriendsPopUp';

render(
  <HashRouter>
    <Route path="/" exact component={App} />
    <Route path="/findfriends" exact component={FindFriendsPopUp} />
  </HashRouter>,
  document.getElementById('root')
);
