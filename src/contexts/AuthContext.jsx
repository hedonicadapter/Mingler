import { ipcRenderer } from 'electron';
import React, { useContext, useState, useEffect } from 'react';
// import http from 'http';
import { assert } from 'console';

import { app, anonCredentials } from '../config/realmDB';
import WelcomePane from '../components/WelcomePane';
import DAO from '../config/DAO';

const nameGenerator = require('positive-name-generator');
const Store = require('electron-store');

const store = new Store();

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(app.currentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    currentUser ? setLoading(false) : setLoading(true);
  }, [currentUser]);

  const refreshCustomUserData = async () => {
    await app.currentUser.refreshCustomData();
  };

  function setName(newName) {
    refreshCustomUserData();
  }

  const nameNewAccount = async (newName) => {
    const appendedName = nameGenerator().replace(/ /g, '');
    const placeholderAdress = '@example.com';
    const email = newName + appendedName + placeholderAdress;

    DAO.findUserByEmail(email).then((result) => {
      console.log(result);
    });

    // const user = await app.emailPasswordAuth.registerUser(
    //   'eheh.jasper@example.com',
    //   'passw0rd'
    // );
  };

  async function anonymousLogin() {
    try {
      console.log(user);

      // assert(user.id === app.currentUser.id);
      return user;
    } catch (e) {
      console.log('Anonymous login failed: ', e);
      const user = await app.logIn(anonCredentials);

      return user;
    }
  }

  function login() {
    anonymousLogin().then((user) => {
      store.set('returningAnonUserID', user.id);

      // console.log(user);
      setCurrentUser(user.id);
    });

    // auth.onAuthStateChanged((user) => {
    //   const userRef = db.collection('Users').doc(user.uid);
    //   const usersRef = db.collection('Users');

    //   // Add current user to each of their friends' OnlineFriends collection
    //   userRef.get().then((doc) => {
    //     doc.data().Friends.forEach((friend) => {
    //       usersRef
    //         .doc(friend)
    //         .collection('OnlineFriends')
    //         .doc(user.uid)
    //         .set(new Object());
    //     });
    //   });

    //   userRef.set({ Name: user.displayName, Guest: true }, { merge: true });

    //   setCurrentUser(user);
    //   ipcRenderer.send('currentUserID', user.uid);
    //   setLoading(false);
    // });

    // return unsubscribe();
  }
  var http = require('http');
  let server;

  function sendUserIDToChromiumExtension() {
    ipcRenderer.send(
      'sendUserIDToChromiumExtension',
      JSON.stringify(currentUser.uid)
    );
  }

  useEffect(() => {
    login();
  }, []);

  useEffect(() => {
    if (currentUser) {
      sendUserIDToChromiumExtension();
    }
  }, [currentUser]);

  const value = {
    currentUser,
    setName,
    nameNewAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
