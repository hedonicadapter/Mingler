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
        dispatch(setCurrentUserMain(result.data));

        return { success: true };
      })
      .catch((e) => {
        return { error: e.response.data.error };
      });
  };

  const signUpGuest = async (username) => {
    return await DAO.signUpGuest(username, clientFingerprint)
      .then((result) => {
        console.log('signup guest ', result.data);
        dispatch(setCurrentUserMain(result.data));

        //set fingerprint
        return { success: true, _id: result.data._id };
      })
      .catch((e) => {
        return { error: e.response.data.error };
      });
  };

  const signInGuest = async (userID = currentUser?._id) => {
    return await DAO.signInGuest(userID, clientFingerprint)
      .then((result) => {
        console.log('signin guest ', result.data);
        dispatch(setCurrentUserMain(result.data));
        setRecentUser({
          userID,
          email: null,
          fingerprint: clientFingerprint,
          guest: true,
        });

        //for the socket in main
        ipcRenderer.send('currentUser:signedIn', result.data._id);

        setSignedIn(true);
      })
      .catch((e) => console.log);
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

        dispatch(setCurrentUserMain(result.data));
        setRecentUser({
          userID: result.data._id,
          email,
          fingerprint: clientFingerprint,
          guest: false,
        });

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

  const signInRememberedUser = async (refreshToken) => {
    await DAO.signInRememberedUser(refreshToken)
      .then((result) => {
        dispatch(setCurrentUserMain(result.data));
        setRecentUser({
          userID: result.data._id,
          email: result.data.email,
          fingerprint: clientFingerprint,
          guest: false,
        });

        ipcRenderer.send('currentUser:signedIn', result.data._id); //for the socket in main

        setSignedIn(true);
      })
      .catch((e) => {
        setSignedIn(false);
        console.log(e);
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
      signInRememberedUser(currentUser?.refreshToken);
    } else if (
      !signedIn &&
      currentUser &&
      currentUser.guest &&
      currentUser.refreshToken
    ) {
      signInGuest(currentUser._id);
    }
  }, []);

  // Finished logging in
  useEffect(() => {
    if (currentUser?.length && signedIn) {
      ipcRenderer.send('toChromiumHost:userID', currentUser._id);
    }
  }, [currentUser, signedIn]);

  useEffect(() => {
    ipcRenderer.on('refreshtoken:frommain', (e, { currentUser }) => {
      dispatch(setCurrentUserMain(currentUser));
    });
  }, []);

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
