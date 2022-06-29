import React, { useState } from 'react';
import colors from '../config/colors';
import DAO from '../config/DAO';
import { motion } from 'framer-motion';

const ipcRenderer = require('electron').ipcRenderer;
const login = require('facebook-chat-api');
const fs = require('fs');

import styles from './ConnectChatClientPopup.module.css';
import messengerLogo from '../../assets/icons/messenger_logo.png';
import { LoadingAnimation } from './reusables/LoadingAnimation';
import { useDispatch, useSelector } from 'react-redux';
import {
  getCurrentUser,
  setAccessTokenMain,
} from '../mainState/features/settingsSlice';

// TODO:
// use a proper redirect uri
export default function ConnectChatClientPopup() {
  const [chosenClient, setChosenClient] = useState();
  const [emailOrPhone, setEmailOrPhone] = useState();
  const [password, setPassword] = useState(null);
  const [emailOrPhoneFieldFocused, setEmailOrPhoneFieldFocused] = useState();
  const [passwordFieldFocused, setPasswordFieldFocused] = useState();
  // String booleans to include loading. Done this way to add an extra variant for
  // the connect button motion component.
  const [formFilled, setFormFilled] = useState('false');
  const [error, setError] = useState(null);
  const [_id, set_id] = useState(null);

  const currentUser = useSelector((state) => getCurrentUser(state));

  const dispatch = useDispatch();

  ipcRenderer.once('chosenClient', (event, value) => {
    const { chosenClient, email, accessToken, userID } = value;

    setChosenClient(chosenClient);
    setEmailOrPhone(email);
    dispatch(setAccessTokenMain(accessToken));
    set_id(userID);
  });

  const handleEmailInput = (evt) => {
    setEmailOrPhone(evt.target.value);
    validator();
  };
  const handlePasswordInput = (evt) => {
    setPassword(evt.target.value);
    validator();
  };
  const handleBackspaceAndEnter = (evt, fieldName) => {
    if (evt.key === 'Enter') {
      if (formFilled === 'true') handleConnectButton();
    } else if (evt.key === 'Delete' || evt.key === 'Backspace') {
      if (fieldName === 'emailOrPhone') {
        setEmailOrPhone(evt.target.value);
      } else if (fieldName === 'password') {
        setPassword(evt.target.value);
      }
      validator();
    }
  };

  const handleConnectButton = () => {
    let credentials = { email: emailOrPhone, password };
    setFormFilled('loading');

    let options = {
      userAgent:
        'Mozilla/5.0 (Linux; Android 6.0.1; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Mobile Safari/537.36',
      listenEvents: true,
      selfListen: true,
    };

    try {
      login(credentials, options, (err, api) => {
        if (err) {
          setFormFilled('true');
          setError(err.error);
          return;
        }

        DAO.saveMessengerCredentials(
          currentUser?.accessToken,
          'appstate.json',
          JSON.stringify(api.getAppState())
        ).then((res) => {
          setError(null);
          setFormFilled('true');
        });
      });
    } catch (e) {
      setError(null);
      throw new Error(e);
    }
  };

  const validator = () => {
    if (emailOrPhone && password) {
      setFormFilled('true');
    } else setFormFilled('false');
  };

  return (
    <div className={styles.containerBg}>
      <div className={[styles.container, 'clickable'].join(' ')}>
        <img
          src={messengerLogo}
          width={55}
          height={55}
          style={{ marginLeft: 'auto', marginRight: 'auto', paddingBottom: 30 }}
        />
        <h1 className={styles.headerText}>Messenger</h1>
        <h3 className={styles.subHeaderText}>
          Sign in with Facebook to connect.
        </h3>
        <div
          style={{
            color: colors.samSexyRed,
            textAlign: 'left',
            marginLeft: 6,
            fontSize: '0.7em',
          }}
        >
          {error}
        </div>
        <input
          disabled={formFilled === 'loading' ? true : false}
          placeholder="Email adress or phone number"
          type="email"
          value={emailOrPhone || ''}
          onChange={handleEmailInput}
          onKeyUp={(evt) => handleBackspaceAndEnter(evt, 'emailOrPhone')}
          className={[styles.inputStyle, 'undraggable', 'clickable'].join(' ')}
          style={{
            color:
              emailOrPhoneFieldFocused && emailOrPhone
                ? colors.darkmodeHighWhite
                : colors.darkmodeMediumWhite,
          }}
          autoFocus={true}
          onFocus={() => {
            setEmailOrPhoneFieldFocused(true);
          }}
          onBlur={() => {
            setEmailOrPhoneFieldFocused(false);
          }}
        />
        <input
          disabled={formFilled === 'loading' ? true : false}
          placeholder="Password"
          type="password"
          value={password || ''}
          onChange={handlePasswordInput}
          onKeyUp={(evt) => handleBackspaceAndEnter(evt, 'password')}
          className={[styles.inputStyle, 'undraggable', 'clickable'].join(' ')}
          style={{
            color:
              passwordFieldFocused && password
                ? colors.darkmodeHighWhite
                : colors.darkmodeMediumWhite,
          }}
          onFocus={() => {
            setPasswordFieldFocused(true);
          }}
          onBlur={() => {
            setPasswordFieldFocused(false);
          }}
        />
        <motion.div
          animate={formFilled}
          variants={{
            true: {
              backgroundColor: colors.samBlue,
              color: colors.darkmodeHighWhite,
            },
            false: {
              backgroundColor: colors.darkmodeDisabledBlack,
              color: colors.darkmodeDisabledText,
            },
            loading: {
              backgroundColor: colors.darkmodeDisabledBlack,
              color: colors.darkmodeDisabledText,
              cursor: 'auto',
            },
          }}
          whileTap={{ opacity: 0.4, transition: { duration: 0.1 } }}
          className={styles.connectButton}
          // formFilled={formFilled}
          onClick={handleConnectButton}
        >
          Connect
          {formFilled === 'loading' && <LoadingAnimation />}
        </motion.div>
        keep me signed in
      </div>
    </div>
  );
}
