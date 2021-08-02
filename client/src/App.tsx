import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.global.css';
import Widget from './components/Widget';

import WelcomePane from './components/WelcomePane';
import PrivateRoute from './components/routing/PrivateRoute.js';

export default function App() {
  return (
    <Router>
      <div>
        <Switch>
          <PrivateRoute exact path="/" component={WelcomePane} />
          <Route exact path="/welcome" component={WelcomePane} />
          <Route exact path="/login" component={WelcomePane} />
          <Route exact path="/register" component={WelcomePane} />
          <Route exact path="/forgotPassword" component={WelcomePane} />
          <Route
            exact
            path="/passwordreset/:resetToken"
            component={WelcomePane}
          />
        </Switch>
      </div>
    </Router>
  );
  //  return <Widget />;
}
