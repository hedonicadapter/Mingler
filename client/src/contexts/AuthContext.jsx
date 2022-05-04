import { ipcRenderer } from 'electron';
import React, { useContext, useState, useEffect, createContext } from 'react';
import { connect } from 'react-redux';
import { assert } from 'console';
import * as Realm from 'realm-web';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

import { app } from '../config/realmDB';
import SplashScreen from '../components/SplashScreen';
import DAO from '../config/DAO';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  getCurrentUser,
  setCurrentUserMain,
  setTokenMain,
} from '../mainState/features/settingsSlice';

const { useLocalStorage } = require('../helpers/localStorageManager');

const AuthContext = createContext();

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

export function authAndy({ children }) {
  const currentUser = useSelector((state) => getCurrentUser(state));
  const dispatch = useDispatch();

  // const [currentUser, setCurrentUser] = useState(settingsState.currentUser);
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
        dispatch(setTokenMain(result.data.token));

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
      dispatch(setCurrentUserMain(result.data));
      setRecentUser({
        userID,
        email: null,
        fingerprint: clientFingerprint,
        guest: true,
      });
      // setCurrentUser(result.data);
      setToken(result.data.token);
      dispatch(setTokenMain(result.data.token));

      // Access token refresh token pair
      localStorage.setItem(result.data.token, result.data.refreshToken);

      ipcRenderer.send('currentUser:signedIn', result.data._id); //for the socket in main
    });
  };

  const signOut = () => {
    setUserID(null);
    // setCurrentUser(null);
    setToken(null);
    dispatch(setCurrentUserMain(null));
    dispatch(setTokenMain(null));

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
        dispatch(setCurrentUserMain(result.data));
        setRecentUser({
          userID: result.data._id,
          email,
          fingerprint: clientFingerprint,
          guest: false,
        });
        // setCurrentUser(result.data);
        setToken(result.data.token);
        dispatch(setTokenMain(result.data.token));
        setUserID(result.data._id);

        // Access token refresh token pair
        localStorage.setItem(result.data.token, result.data.refreshToken);

        ipcRenderer.send('currentUser:signedIn', result.data._id); //for the socket in main

        return { success: true };
      })
      .catch((e) => {
        return { error: e.response.data.error };
      });
  };

  const signout = () => {
    setUserID(null);
    // setCurrentUser(null);
    setToken(null);
    dispatch(setCurrentUserMain(null));
    dispatch(setTokenMain(null));
    ipcRenderer.send('currentUser:signedOut');
  };

  const storeToken = () => {
    return;
  };

  const deleteToken = () => {
    return;
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
    if (token && currentUser) {
      console.log('TOKEN AND CURRENTUSERLENGTH');
      setLoading(false);
    } else setLoading(true);

    if (token) {
      console.log('tokenized');
    }
    if (currentUser) {
      console.log('currentUserized');
    }
  }, [token, currentUser]);

  // Finished logging in
  useEffect(() => {
    if (currentUser.length && loading) {
      ipcRenderer.send('toChromiumHost:userID', currentUser._id);
    }
  }, [currentUser, loading]);

  ipcRenderer.on('refreshtoken:frommain', (e, { access, refresh }) => {
    setToken(access);
    dispatch(setTokenMain(access));
  });

  const value = {
    currentUser,
    token,
    recentUser,
    setName,
    signOut,
    signUpWithEmail,
    signUpGuest,
    signInGuest,
    signIn,
    storeToken,
  };
  const DummyInputComponent = () => {
    const [test, setTest] = useState(null);
    return (
      <>
        <input
          type="text"
          value={test || ''}
          onChange={(e) => setTest(e.target.value)}
        />
      </>
    );
  };
  return (
    <AuthContext.Provider value={value}>
      <AnimatePresence>
        {!currentUser._id ? (
          <motion.div
            key={0}
            initial={{ opacity: 0, x: '120%' }}
            animate={{ opacity: 1, x: '0%' }}
            exit={{ opacity: 0, x: '120%' }}
            duration={0.1}
          >
            <SplashScreen />
            {/* <DummyInputComponent /> */}
          </motion.div>
        ) : (
          !loading && (
            <div
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
            </div>
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
const mapStateToProps = (state, ownProps) => {
  return state;
};
export const AuthProvider = connect(mapStateToProps)(authAndy);
