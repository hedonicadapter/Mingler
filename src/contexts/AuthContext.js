import { ipcRenderer } from 'electron';
import React, { useContext, useState, useEffect } from 'react';
import { auth, db, functions, rdb } from '../config/firebase';
import http from 'http';

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);

  function setName(newName) {
    currentUser
      ?.updateProfile({
        displayName: newName,
      })
      .then(function () {
        console.log('name set');
      })
      .catch(function (error) {
        console.log('Error while setting name: ', error);
      });
  }

  function anonymousLogin() {
    auth
      .signInAnonymously()
      .then(function () {})
      .catch(function (error) {
        console.log(error.code);
        console.log(error.message);
      });

    auth.onAuthStateChanged((user) => {
      const userRef = db.collection('Users').doc(user.uid);
      const usersRef = db.collection('Users');

      // Add current user to each of their friends' OnlineFriends collection
      userRef.get().then((doc) => {
        doc.data().Friends.forEach((friend) => {
          usersRef
            .doc(friend)
            .collection('OnlineFriends')
            .doc(user.uid)
            .set(new Object());
        });
      });

      userRef.set({ Name: user.displayName, Guest: true }, { merge: true });

      setCurrentUser(user);
      ipcRenderer.send('currentUserID', user.uid);
      setLoading(false);
    });

    // return unsubscribe();
  }
  var http = require('http');
  let server;

  function sendUserIDToChromiumExtension() {
    server?.flush();
    server?.close();
    const PORT = process.env.PORT || 8080;

    try {
      server = http
        .createServer(function (request, response) {
          response.writeHeader(200, {
            'Cache-Control': 'no-cache',
            'Content-Type': 'text/html',
          });
          response.write(JSON.stringify(currentUser.uid), () => {
            console.log('Writing string Data...');
          });
          response.end();
        })
        .listen(PORT);
    } catch (exception) {
      console.log('Creating server exception: ', exception);
    }
  }

  useEffect(() => {
    anonymousLogin();
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
