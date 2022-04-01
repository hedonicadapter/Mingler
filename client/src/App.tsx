import React from 'react';
import './App.global.css';
import Widget from './components/Widget';
import { ConnectedRouter } from 'connected-react-router';
import { Route } from 'react-router';
import ConnectChatClientPopup from './components/ConnectChatClientPopup';
import SettingsContent from './components/SettingsContent';
import FindFriendsPopUp from './components/FindFriendsPopUp';

export default function App({ history, context }) {
  return (
    <ConnectedRouter history={history} context={context}>
      <Route path="/" exact component={Widget} />
      <Route path="/findfriends" exact component={FindFriendsPopUp} />
      <Route path="/settings" exact component={SettingsContent} />
      <Route
        path="/connectChatClient"
        exact
        component={ConnectChatClientPopup}
      />
    </ConnectedRouter>
  );
}
