import { ipcRenderer } from 'electron';
import React, { useContext, useState, useEffect } from 'react';
// import http from 'http';
import { assert } from 'console';
import * as Realm from 'realm-web';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

import { app, anonCredentials } from '../config/realmDB';
import WelcomePane from '../components/WelcomePane';
import DAO, { setAuthToken } from '../config/DAO';
import { AnimatePresence, motion } from 'framer-motion';

const {
  setMostRecentUser,
  getMostRecentUser,
} = require('../helpers/localStorageManager');
const nameGenerator = require('positive-name-generator');
const Store = require('electron-store');

const store = new Store();

const AuthContext = React.createContext();

// ============ Client fingerprint ============
// Used to authenticate guest users
const fpPromise = FingerprintJS.load();

(async () => {
  const fp = await fpPromise;
  const result = await fp.get();

  window.localStorage.setItem('clientFingerprint', result.visitorId);
})();
// ============ Client fingerprint ============

let generateNameRetryLimit = 0;

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(currentUser);
    currentUser ? setLoading(false) : setLoading(true);
  }, [currentUser]);

  const refreshCustomUserData = async () => {
    await app.currentUser.refreshCustomData();
  };

  function setName(newName) {
    refreshCustomUserData();
  }

  let retryLimit = 0;

  const generatePlaceholderEmail = (name) => {
    const appendedName = nameGenerator().replace(/ /g, '');
    const placeholderAdress = '@example.com';

    return name + appendedName + placeholderAdress;
  };

  const registerGuest = async (username, clientFingerprint) => {
    return await DAO.registerGuest(username, clientFingerprint)
      .then((result) => {
        const userID = result.data.guestID;

        window.localStorage.setItem('guestID', userID);

        //set fingerprint
        return { success: true };
      })
      .catch((e) => {
        return { error: e.response.data.error };
      });
  };

  const loginGuest = async () => {
    const guestID = window.localStorage.getItem('guestID');
    const fingerprint = window.localStorage.getItem('clientFingerprint');

    return await DAO.loginGuest(guestID, fingerprint).then((result) => {
      setMostRecentUser(guestID, null, fingerprint, true);
      setCurrentUser(result.data.guestID);
      setToken(result.data.token);
    });
  };

  const login = async (email, password) => {
    const fingerprint = window.localStorage.getItem('clientFingerprint');

    return await DAO.login(email, password, fingerprint).then((result) => {
      setMostRecentUser(result.data._id, email, fingerprint, true);
      setCurrentUser(result.data._id);
      setToken(result.data.token);
    });
  };

  const logout = async () => {
    // store.get(recently signed out) -> show sign in form with user credentials if remembered
    const logoutDB = async () => {
      await app.currentUser.logOut();
    };

    logoutDB().then(() => {
      setCurrentUser(null);
    });
  };

  var http = require('http');
  let server;

  function sendUserIDToChromiumExtension() {
    ipcRenderer.send(
      'sendUserIDToChromiumExtension',
      JSON.stringify(currentUser.uid)
    );
  }

  useEffect(() => {
    const recentUser = getMostRecentUser();

    if (recentUser) {
      if (recentUser.guest) loginGuest();
      else if (!recentUser.guest)
        console.log('log in with recent non guest user');
    } else console.log('show sign in or sign up screen');
  }, []);

  useEffect(() => {
    if (currentUser) {
      sendUserIDToChromiumExtension();
    }
  }, [currentUser]);

  useEffect(() => {
    console.log('token changed ', token);
    setAuthToken(token);
  }, [token]);

  const value = {
    currentUser,
    setName,
    logout,
    registerGuest,
    loginGuest,
    login,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* {loading ? <WelcomePane /> : children} */}
      <AnimatePresence>
        {loading ? (
          <motion.div
            key={0}
            initial={{ opacity: 0, x: '120%' }}
            animate={{ opacity: 1, x: '0%' }}
            exit={{ opacity: 0, x: '120%' }}
            duration={0.1}
          >
            <WelcomePane />
          </motion.div>
        ) : (
          <motion.div
            key={1}
            initial={{ x: '120%' }}
            animate={{ x: '0%' }}
            exit={{ x: '120%' }}
            duration={0.1}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </AuthContext.Provider>
  );
}
