import { ipcRenderer } from 'electron';
import React, { useContext, useState, useEffect } from 'react';
// import http from 'http';
import { assert } from 'console';
import * as Realm from 'realm-web';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

import { app, anonCredentials } from '../config/realmDB';
import WelcomePane from '../components/WelcomePane';
import DAO from '../config/DAO';
import { AnimatePresence, motion } from 'framer-motion';

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

  const nameNewAccount = async (name) => {
    const email = generatePlaceholderEmail(name);

    return await DAO.findUserByEmail(email).then((result) => {
      if (!result.data) {
        registerByEmail(email)
          .then(() => {
            store.set('anonymousEmail', email);

            console.log('Registration: ', email);
          })
          .catch((e) => {
            console.log('Registration failed');
          });
        return { registered: true };
      }
      return { registered: false };
    });
  };

  const registerByEmail = async (email) => {
    await app.emailPasswordAuth.registerUser(email, '§!´DontBruteforceMe');
  };

  async function anonymousLogin(email = store.get('anonymousEmail')) {
    try {
      const anoncred = Realm.Credentials.emailPassword(
        email,
        '§!´DontBruteforceMe'
      );

      const user = await app.logIn(anoncred);

      assert(user.id === app.currentUser.id);
      setCurrentUser(user);
      return user;
    } catch (e) {
      console.log('Anonymous login failed: ', e);
    }
  }

  const logout = async () => {
    const logoutDB = async () => {
      await app.currentUser.logOut();
    };

    logoutDB().then(() => {
      setCurrentUser(null);
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
    nameNewAccount,
    anonymousLogin,
    logout,
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
