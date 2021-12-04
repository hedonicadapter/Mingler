import { ipcRenderer } from 'electron';
import React, { useContext, useState, useEffect } from 'react';

import { assert } from 'console';
import * as Realm from 'realm-web';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

import { app, anonCredentials } from '../config/realmDB';
import SplashScreen from '../components/SplashScreen';
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
  const [clientFingerprint, setClientFingerprint] =
    useLocalStorage('clientFingerprint');

  // deprecated: realm
  const refreshCustomUserData = async () => {
    await app.currentUser.refreshCustomData();
  };

  // deprecated: realm
  function setName(newName) {
    refreshCustomUserData();
  }

  const signUpWithEmail = async (name, email, password) => {
    return await DAO.signUpWithEmail(name, email, password, clientFingerprint)
      .then((result) => {
        setToken(result.data.token);

        return { success: true };
      })
      .catch((e) => {
        return { error: e.response.data.error };
      });
  };

  const signInWithEmailAndPassword = async (email, password) => {
    return await DAO.signIn(email, password)
      .then((result) => {
        setRecentUser({
          userID: result.data._id,
          email,
          fingerprint: clientFingerprint,
          guest: false,
        });
        setCurrentUser(result.data);
        setToken(result.data.token);

        // Access token refresh token pair
        localStorage.setItem(result.data.token, result.data.refreshToken);

        return { success: true };
      })
      .catch((e) => {
        return { error: e.response.data.error };
      });
  };

  const signUpGuest = async (username) => {
    return await DAO.signUpGuest(username, clientFingerprint)
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

  const signInGuest = async () => {
    const userID = localStorage.getItem('userID');

    return await DAO.signInGuest(userID, clientFingerprint).then((result) => {
      setRecentUser({
        userID,
        email: null,
        fingerprint: clientFingerprint,
        guest: true,
      });
      setCurrentUser(result.data);
      setToken(result.data.token);

      // Access token refresh token pair
      localStorage.setItem(result.data.token, result.data.refreshToken);
    });
  };

  const signOut = () => {
    setUserID(null);
    setCurrentUser(null);
    setToken(null);

    console.log('currentUser ', currentUser);

    if (currentUser.guest) {
      setRecentUser({
        userID: null,
        email: null,
        fingerprint: null,
        guest: null,
      });
    }
  };

  const signIn = async (email, password) => {
    //set current user in localstorage

    return await DAO.signIn(email, password, clientFingerprint)
      .then((result) => {
        setRecentUser({
          userID: result.data._id,
          email,
          fingerprint: clientFingerprint,
          guest: false,
        });
        setCurrentUser(result.data);
        setToken(result.data.token);

        // Access token refresh token pair
        localStorage.setItem(result.data.token, result.data.refreshToken);

        return { success: true };
      })
      .catch((e) => {
        return { error: e.response.data.error };
      });
  };

  const signout = () => {
    setUserID(null);
    setCurrentUser(null);
    setToken(null);
  };

  const storeToken = () => {
    return;
  };

  const deleteToken = () => {
    return;
  };

  // Send ID to host
  const sendUserIDToChromiumHost = () => {
    io.sockets.emit('native:userID', currentUser._id);
  };

  // useEffect(() => {
  //   const mostRecent = recentUser?.[0];

  //   if (mostRecent) {
  //     if (mostRecent.guest) loginGuest();
  //     else if (!mostRecent.guest)
  //       console.log('log in with recent non guest user');
  //   } else console.log('show sign in or sign up screen');
  // }, [recentUser]);

  useEffect(() => {
    console.log('token', token);
    console.log('currentUser', currentUser);
    if (token && currentUser) setLoading(false);
    else setLoading(true);
  }, [token, currentUser]);

  // Finished logging in
  useEffect(() => {
    if (currentUser && loading) {
      ipcRenderer.send('toChromiumHost:userID', currentUser._id);
    }

    console.log('currentUser ', currentUser);
  }, [currentUser, loading]);

  ipcRenderer.on('refreshtoken:frommain', (e, { access, refresh }) => {
    setToken(access);
  });

  const value = {
    currentUser,
    token,
    recentUser,
    setName,
    signOut,
    signUpWithEmail,
    signInWithEmailAndPassword,
    signUpGuest,
    signInGuest,
    signIn,
    storeToken,
  };

  return (
    <AuthContext.Provider value={value}>
      <AnimatePresence>
        {!currentUser ? (
          <motion.div
            key={0}
            initial={{ opacity: 0, x: '120%' }}
            animate={{ opacity: 1, x: '0%' }}
            exit={{ opacity: 0, x: '120%' }}
            duration={0.1}
          >
            <SplashScreen />
          </motion.div>
        ) : (
          !loading && (
            <motion.div
              // key={1}
              // initial={{ x: '120%' }}
              // animate={{ x: '0%' }}
              // exit={{ x: '120%' }}
              // duration={0.1}
              style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {children}
            </motion.div>
          )
        )}
        {/* <motion.div
          key={0}
          initial={{ opacity: 0, x: '120%' }}
          animate={{ opacity: 1, x: '0%' }}
          exit={{ opacity: 0, x: '120%' }}
          duration={0.1}
        >
          <SplashScreen />
        </motion.div> */}
      </AnimatePresence>
    </AuthContext.Provider>
  );
}
