import { ipcRenderer } from 'electron';
import React, { useContext, useState, useEffect } from 'react';
// import http from 'http';
import { app, anonCredentials } from '../config/realmDB';
import { assert } from 'console';

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

  useEffect(() => {
    console.log(loading);
  }, [loading]);

  const refreshCustomUserData = async () => {
    await app.currentUser.refreshCustomData();
  };

  function setName(newName) {
    refreshCustomUserData();
  }

  async function anonymousLogin() {
    try {
      const user = await app.logIn(anonCredentials);

      assert(user.id === app.currentUser.id);
      return user;
    } catch (e) {
      console.log('Anonymous login failed: ', e);
    }
  }

  function login() {
    anonymousLogin().then((user) => {
      console.log('Signed in anonymously.');

      setCurrentUser(user);
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
  };
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
