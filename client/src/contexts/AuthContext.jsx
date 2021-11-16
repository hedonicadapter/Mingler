import { ipcRenderer } from 'electron';
import React, { useContext, useState, useEffect } from 'react';

import { assert } from 'console';
import * as Realm from 'realm-web';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

import { app, anonCredentials } from '../config/realmDB';
import WelcomePane from '../components/WelcomePane';
import DAO from '../config/DAO';
import { AnimatePresence, motion } from 'framer-motion';

const { useLocalStorage } = require('../helpers/localStorageManager');
const Store = require('electron-store');

const store = new Store();

const AuthContext = React.createContext();

// ============ Client fingerprint ============
// Used to authenticate guest users
const fpPromise = FingerprintJS.load();

(async () => {
  const fp = await fpPromise;
  const result = await fp.get();

  localStorage.setItem('clientFingerprint', result.visitorId);
})();
// ============ Client fingerprint ============

let generateNameRetryLimit = 0;

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userID, setUserID] = useLocalStorage('userID');
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useLocalStorage('token');
  const [recentUser, setRecentUser] = useLocalStorage(
    'mostRecentRememberedUser'
  );

  const refreshCustomUserData = async () => {
    await app.currentUser.refreshCustomData();
  };

  function setName(newName) {
    refreshCustomUserData();
  }

  let retryLimit = 0;

  const registerGuest = async (username, clientFingerprint) => {
    return await DAO.registerGuest(username, clientFingerprint)
      .then((result) => {
        const id = result.data._id;

        localStorage.setItem('userID', id);

        //set fingerprint
        return { success: true };
      })
      .catch((e) => {
        return { error: e.response.data.error };
      });
  };

  const loginGuest = async () => {
    const userID = localStorage.getItem('userID');
    const fingerprint = localStorage.getItem('clientFingerprint');

    return await DAO.loginGuest(userID, fingerprint).then((result) => {
      setRecentUser({ userID, email: null, fingerprint, guest: true });
      setCurrentUser(result.data);
      setToken(result.data.token);
      localStorage.setItem('token', result.data.token);
    });
  };

  const logoutGuest = async () => {
    localStorage.removeItem('userID');
    localStorage.removeItem('token');
    setRecentUser({
      userID: null,
      email: null,
      fingerprint: null,
      guest: null,
    });
    setCurrentUser(null);
    setToken(null);
  };

  const login = async (email, password) => {
    const fingerprint = localStorage.getItem('clientFingerprint');

    //set current user in localstorage

    return await DAO.login(email, password, fingerprint).then((result) => {
      setRecentUser(result.data._id, email, fingerprint, true);
      setCurrentUser(result.data);
      setToken(result.data.token);
      localStorage.setItem('token', result.data.token);
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

  // Send ID to host
  const sendUserIDToChromiumHost = () => {
    io.sockets.emit('native:userID', currentUser._id);
  };

  useEffect(() => {
    const mostRecent = recentUser?.[0];
    console.log('mostRecent ', mostRecent);
    if (mostRecent) {
      if (mostRecent.guest) loginGuest();
      else if (!mostRecent.guest)
        console.log('log in with recent non guest user');
    } else console.log('show sign in or sign up screen');
  }, [recentUser]);

  useEffect(() => {
    if (token && currentUser) setLoading(false);
    else setLoading(true);
  }, [token, currentUser]);

  useEffect(() => {
    if (currentUser && loading) {
      ipcRenderer.send('toChromiumHost:userID', currentUser._id);
    }
  }, [currentUser, loading]);

  const value = {
    currentUser,
    token,
    setName,
    logout,
    registerGuest,
    loginGuest,
    logoutGuest,
    login,
  };

  return (
    <AuthContext.Provider value={value}>
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
            // initial={{ x: '120%' }}
            // animate={{ x: '0%' }}
            // exit={{ x: '120%' }}
            duration={0.1}
            style={{
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </AuthContext.Provider>
  );
}
