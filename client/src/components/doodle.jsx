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
import genericErrorHandler from '../helpers/genericErrorHandler';

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

  const [error, setError] = useState(null);
  const [signedIn, setSignedIn] = useState(false);
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
        if (result.data.success) {
          dispatch(setCurrentUserMain(result.data));

          return { success: true, email: result.data.email };
        }
      })
      .catch(genericErrorHandler);
  };

  const signUpGuest = async (username) => {
    return await DAO.signUpGuest(username, clientFingerprint)
      .then((result) => {
        if (result.data.success) {
          dispatch(setCurrentUserMain(result.data));

          //set fingerprint
          return { success: true, _id: result.data._id };
        }
      })
      .catch((e) => {
        return { error: e.response.data.error };
      });
  };

  const signInGuest = async (userID = currentUser?._id) => {
    return await DAO.signInGuest(userID, clientFingerprint)
      .then((result) => {
        if (result.data.success) {
          dispatch(setCurrentUserMain(result.data));

          setSignedIn(true);
          return { success: true, email: result.data.email };
        }
      })
      .catch(genericErrorHandler);
  };

  const signOut = () => {
    ipcRenderer.send('currentUser:signedOut');
    setSignedIn(false);
    dispatch(setCurrentUserMain(null));
  };

  const signIn = async (email, password, keepMeSignedIn) => {
    return await DAO.signIn(email, password, clientFingerprint)
      .then((result) => {
        if (result.data.success) {
          let tokens = {
            accessToken: result.data.accessToken,
            refreshToken: result.data.refreshToken,
          };

          dispatch(setCurrentUserMain(result.data));

          ipcRenderer.send('currentUser:signedIn', result.data._id); //for the socket in main

          if (keepMeSignedIn) {
            dispatch(setKeepMeSignedInMain(tokens));
          } else {
            dispatch(setKeepMeSignedInMain(null));
          }

          setSignedIn(true);

          return { success: true };
        }
      })
      .catch(genericErrorHandler);
  };

  const signInRememberedUser = async (refreshToken) => {
    return await DAO.signInRememberedUser(refreshToken)
      .then((result) => {
        if (result.data.success) {
          dispatch(setCurrentUserMain(result.data));

          ipcRenderer.send('currentUser:signedIn', result.data._id); //for the socket in main

          setSignedIn(true);

          return { success: true };
        }
      })
      .catch((e) => {
        setSignedIn(false);
        return genericErrorHandler(e);
      });
  };

  const refreshTokenFromMainHandler = (e, { currentUser }) => {
    dispatch(setCurrentUserMain(currentUser));
  };

  useEffect(() => {
    if (
      !signedIn &&
      currentUser &&
      currentUser.keepMeSignedIn &&
      currentUser.refreshToken
    ) {
      signInRememberedUser(currentUser?.refreshToken)
        .then((res) => {
          if (res?.data?.success) {
            setError(null);
          }
        })
        .catch((e) => setError(e?.response?.data.error));
    } else if (
      !signedIn &&
      currentUser &&
      currentUser.guest &&
      currentUser.refreshToken
    ) {
      signInGuest(currentUser._id)
        .then((res) => {
          if (res?.data?.success) {
            setError(null);
          }
        })
        .catch((e) => window.alert(e.response.data.error));
    }
  }, []);

  // Finished logging in
  useEffect(() => {
    if (currentUser?.length && signedIn) {
      ipcRenderer.send('toChromiumHost:userID', currentUser._id);
    }
  }, [currentUser, signedIn]);

  useEffect(() => {
    ipcRenderer.on('refreshtoken:frommain', refreshTokenFromMainHandler);

    return () =>
      ipcRenderer.removeAllListeners(
        'refreshtoken:frommain',
        refreshTokenFromMainHandler
      );
  }, []);

  const value = {
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
            style={{ height: '100%' }}
          >
            <SplashScreen />
          </motion.div>
        ) : (
          currentUser && (
            <div
              style={{
                height: '100%',
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
