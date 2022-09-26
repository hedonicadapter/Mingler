import React from 'react';
import './App.global.css';
import Widget from './components/Widget';
import { ConnectedRouter } from 'connected-react-router';
import { Route } from 'react-router';
// import ConnectChatClientPopup from './components/ConnectChatClientPopup';
import SettingsContent from './components/SettingsContent';
import FindFriendsContent from './components/FindFriendsContent';
import WelcomeModalContent from './components/WelcomeModalContent';
import SpotifyContent from './components/SpotifyContent';

export default function App({ history, context }) {
  return (
    <ConnectedRouter history={history} context={context}>
      <Route path="/" exact component={Widget} />
      <Route path="/findfriends" exact component={FindFriendsContent} />
      <Route path="/settings" exact component={SettingsContent} />
      <Route path="/spotify" exact component={SpotifyContent} />
      <Route path="/welcome" exact component={WelcomeModalContent} />
      {/* <Route
        path="/connectChatClient"
        exact
        component={ConnectChatClientPopup}
      /> */}
    </ConnectedRouter>
  );
}
