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
  setKeepMeSignedInMain,
  setAccessTokenMain,
  setRefreshTokenMain,
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

  const [signedIn, setSignedIn] = useState(false);
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
        dispatch(setAccessTokenMain(result.data.accessToken));
        dispatch(setRefreshTokenMain(result.data.refreshToken));
        // localStorage.setItem(result.data.accessToken, result.data.refreshToken);

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

      dispatch(setAccessTokenMain(result.data.accessToken));
      dispatch(setRefreshTokenMain(result.data.refreshToken));

      // Access token refresh token pair
      // localStorage.setItem(result.data.accessToken, result.data.refreshToken);

      //for the socket in main
      ipcRenderer.send('currentUser:signedIn', result.data._id);

      setSignedIn(true);
    });
  };

  const signOut = () => {
    setSignedIn(false);
    dispatch(setCurrentUserMain(null));
    ipcRenderer.send('currentUser:signedOut');

    if (currentUser.guest) {
      setRecentUser({
        userID: null,
        email: null,
        fingerprint: null,
        guest: null,
      });
    }
  };

  const signIn = async (email, password, keepMeSignedIn) => {
    return await DAO.signIn(email, password, clientFingerprint)
      .then((result) => {
        let tokens = {
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
        };
        console.log('signin ', result.data);

        dispatch(setCurrentUserMain(result.data));
        setRecentUser({
          userID: result.data._id,
          email,
          fingerprint: clientFingerprint,
          guest: false,
        });

        dispatch(setAccessTokenMain(tokens.accessToken));
        dispatch(setRefreshTokenMain(tokens.refreshToken));

        // Access token refresh token pair
        // localStorage.setItem(result.data.accessToken, result.data.refreshToken);

        ipcRenderer.send('currentUser:signedIn', result.data._id); //for the socket in main

        if (keepMeSignedIn) {
          dispatch(setKeepMeSignedInMain(tokens));
        } else {
          dispatch(setKeepMeSignedInMain(null));
        }

        setSignedIn(true);

        return { success: true };
      })
      .catch((e) => {
        return { error: e.response.data.error };
      });
  };

  const signInRememberedUser = async () => {
    return await DAO.signInRememberedUser(currentUser?.refreshToken)
      .then((result) => {
        console.log('remembered ', result.data.accessToken);
        dispatch(setCurrentUserMain(result.data));
        setRecentUser({
          userID: result.data._id,
          email,
          fingerprint: clientFingerprint,
          guest: false,
        });

        dispatch(setAccessTokenMain(result.data.accessToken));
        dispatch(setRefreshTokenMain(result.data.refreshToken));

        // Access token refresh token pair
        // localStorage.setItem(result.data.accessToken, result.data.refreshToken);

        ipcRenderer.send('currentUser:signedIn', result.data._id); //for the socket in main

        setSignedIn(true);

        return { success: true };
      })
      .catch((e) => {
        return { error: e.response };
      });
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
    if (
      !signedIn &&
      currentUser &&
      currentUser.keepMeSignedIn &&
      currentUser.refreshToken
    ) {
      console.log(
        'boutta sign in remembered user ',
        currentUser?.keepMeSignedIn
      );
      signInRememberedUser()
        .then(() => {
          setSignedIn(true);
        })
        .catch((e) => {
          setSignedIn(false);
          console.log(e);
        });
    }
  }, []);

  // Finished logging in
  useEffect(() => {
    if (currentUser?.length && signedIn) {
      ipcRenderer.send('toChromiumHost:userID', currentUser._id);
    }
  }, [currentUser, signedIn]);

  ipcRenderer.on('refreshtoken:frommain', (e, { access, refresh }) => {
    dispatch(setAccessTokenMain(access));
    dispatch(setRefreshTokenMain(refresh));
  });

  const value = {
    recentUser,
    setName,
    signOut,
    signUpWithEmail,
    signUpGuest,
    signInGuest,
    signIn,
  };

  return (
    <AuthContext.Provider value={value}>
      <AnimatePresence>
        {!signedIn ? (
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
          currentUser && (
            <div
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
      </AnimatePresence>
    </AuthContext.Provider>
  );
}
const mapStateToProps = (state, ownProps) => {
  return state;
};
export const AuthProvider = connect(mapStateToProps)(authAndy);
