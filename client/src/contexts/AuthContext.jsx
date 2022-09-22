import { ipcRenderer, remote } from 'electron';
import React, { useContext, useState, useEffect, createContext } from 'react';
import { connect } from 'react-redux';
import { assert } from 'console';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

import { notify } from '../components/reusables/notifications';
import SplashScreen from '../components/SplashScreen';
import DAO from '../config/DAO';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  getCurrentUser,
  getSettings,
  setCurrentUserMain,
  setKeepMeSignedInMain,
} from '../mainState/features/settingsSlice';
import genericErrorHandler from '../helpers/genericErrorHandler';
import { Memoized } from '../components/reusables/Memoized';

const { useLocalStorage } = require('../helpers/localStorageManager');

const app = remote.app;
const BrowserWindow = remote.BrowserWindow;

const favicon = __dirname + '../../assets/icons/minglerReversed.ico';

const welcomeModalConfig = {
  title: 'Welcome to Mingler',
  show: false,
  frame: false,
  transparent: true,
  width: 330,
  height: 140,
  icon: favicon,
  resizable: false,
  closable: false,
  alwaysOnTop: true,
  webPreferences: {
    contextIsolation: false,
    nodeIntegration: true,
    enableRemoteModule: true,
    spellcheck: false,
    devTools: false,
  },
};

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
  const currentUser = useSelector(getCurrentUser);
  const settingsState = useSelector(getSettings);
  const dispatch = useDispatch();

  const [demoUser, setDemoUser] = useState(null);

  const [signedIn, setSignedIn] = useState(false);
  const [clientFingerprint, setClientFingerprint] =
    useLocalStorage('clientFingerprint');

  const [welcomeModal, setWelcomeModal] = useState(null);

  const loadWelcomeModal = () => {
    welcomeModal
      .loadURL(`file://${app.getAppPath()}/index.html#/welcome`)
      .then()
      .catch(console.warn);

    welcomeModal.once('ready-to-show', () => {
      welcomeModal.setTitle('Welcome to Mingler');
    });
    welcomeModal.webContents.once('did-finish-load', () => {
      welcomeModal.show();
    });
  };

  const welcomeModalCloseHandler = () => {
    welcomeModal?.setSkipTaskbar(true);
    if (process.platform == 'win32') welcomeModal?.minimize();
    else if (process.platform == 'darwin') app?.hide();
    else welcomeModal?.hide();
  };

  const setCurrentUser = (data) => {
    dispatch(setCurrentUserMain(data));

    ipcRenderer.send('currentUser:signedIn', data._id); //for the socket in main

    setSignedIn(true);
  };

  const signUpWithEmail = async (name, email, password) => {
    return await DAO.signUpWithEmail(name, email, password, clientFingerprint)
      .then((result) => {
        console.warn('sign up with email result ', result);
        if (result?.data?.success) {
          dispatch(setCurrentUserMain(result.data));

          return { success: true, email: result.data.email };
        }
      })
      .catch(genericErrorHandler);
  };

  const signUpGuest = async (username) => {
    return await DAO.signUpGuest(username, clientFingerprint)
      .then((result) => {
        if (result?.data?.success) {
          //set fingerprint
          return { success: true, _id: result.data._id };
        }
      })
      .catch(genericErrorHandler);
  };

  const signInGuest = async (userID) => {
    return await DAO.signInGuest(userID, clientFingerprint)
      .then((result) => {
        if (result.data.success) {
          setCurrentUser(result.data);
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

          setCurrentUser(result.data);

          if (keepMeSignedIn) {
            dispatch(setKeepMeSignedInMain(tokens));
          } else {
            dispatch(setKeepMeSignedInMain(null));
          }

          return { success: true };
        }
      })
      .catch(genericErrorHandler);
  };

  const signInRememberedUser = async (refreshToken) => {
    return await DAO.signInRememberedUser(refreshToken)
      .then((result) => {
        if (result.data.success) {
          setCurrentUser(result.data);
        }
      })
      .catch((e) => {
        setSignedIn(false);
        notify("Couldn't sign in.", e?.response?.data?.error);
      });
  };

  const signInDemoUser = () => {
    DAO.initDemoAccount(clientFingerprint)
      .then((result) => {
        if (result?.data?.success) {
          setDemoUser(result.data);

          dispatch(setCurrentUserMain(result.data));
          ipcRenderer.send('currentUser:signedIn', result.data._id); //for the socket in main

          setSignedIn(true);

          DAO.getDemoActivities()
            .then((result) => {
              if (result.data.success) {
                setDemoUser((prevState) => {
                  return {
                    ...prevState,
                    fakeActivities: result.data.activities,
                  };
                });
              }
            })
            .catch((e) => notify('Failed to set demo up properly.'));
        }
      })
      .catch((e) => notify("Couldn't set demo user. ", e));
  };

  const refreshTokenFromMainHandler = (e, { currentUser }) => {
    console.log({ newerData: currentUser });
    dispatch(setCurrentUserMain(currentUser));
  };

  useEffect(() => {
    if (
      !signedIn &&
      currentUser &&
      currentUser.keepMeSignedIn &&
      currentUser.refreshToken
    ) {
      signInRememberedUser(currentUser?.refreshToken).then().catch();
    } else if (
      !signedIn &&
      currentUser &&
      currentUser.guest &&
      currentUser.refreshToken
    ) {
      signInGuest(currentUser._id)
        .then()
        .catch((e) => notify("Couldn't sign in.", e?.response?.data?.error));
    }
  }, []);

  // Finished logging in
  useEffect(() => {
    if (currentUser?.length && signedIn) {
      ipcRenderer.send('toChromiumHost:userID', currentUser._id);
    }
  }, [currentUser, signedIn]);

  useEffect(() => {
    // initDemoAccount();
    ipcRenderer.on('refreshtoken:frommain', refreshTokenFromMainHandler);

    return () =>
      ipcRenderer.removeAllListeners(
        'refreshtoken:frommain',
        refreshTokenFromMainHandler
      );
  }, []);

  useEffect(() => {
    let welcomeModalStateless = new BrowserWindow(welcomeModalConfig);
    setWelcomeModal(welcomeModalStateless);

    return () => {
      welcomeModalStateless = null;
      setWelcomeModal(null);
    };
  }, []);

  useEffect(() => {
    if (!welcomeModal || welcomeModal.isDestroyed()) return;
    if (!settingsState?.showWelcome) return;
    if (welcomeModal?.isVisible()) return;

    loadWelcomeModal();

    welcomeModal.on('close', welcomeModalCloseHandler);

    return () => {
      welcomeModal.removeListener('close', welcomeModalCloseHandler);
      welcomeModal?.destroy();
    };
  }, [welcomeModal]);

  useEffect(() => {
    ipcRenderer.once('exit:frommain', () => {
      // if (welcomeModal && !welcomeModal?.isDestroyed()) {
      //   // welcomeModal.removeListener('close', welcomeModalCloseHandler);
      // }
      // welcomeModal?.destroy();
      // welcomeModalStateless = null;
      setWelcomeModal(null);
    });
  }, []);

  const value = {
    signOut,
    signUpWithEmail,
    signUpGuest,
    signInDemoUser,
    signInGuest,
    signIn,
    signedIn,
    demoUser,
  };

  return (
    <AuthContext.Provider value={value}>
      <AnimatePresence exitBeforeEnter>
        {currentUser && signedIn && (
          <motion.div key="children">{children}</motion.div>
        )}
        {!signedIn && (
          <Memoized>
            <SplashScreen />
          </Memoized>
        )}
      </AnimatePresence>
    </AuthContext.Provider>
  );
}
const mapStateToProps = (state, ownProps) => {
  return state;
};
export const AuthProvider = connect(mapStateToProps)(authAndy);
