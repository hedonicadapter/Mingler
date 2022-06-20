import { css, styled } from '@stitches/react';
import React, { useState } from 'react';
import colors from '../config/colors';
import DAO from '../config/DAO';
import { motion } from 'framer-motion';

const ipcRenderer = require('electron').ipcRenderer;
const login = require('facebook-chat-api');
const fs = require('fs');

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

  const container = css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    color: colors.darkmodeMediumWhite,
    textAlign: 'center',
    height: '100%',
    marginRight: 30,
    marginLeft: 30,
  });
  const containerBg = css({
    backgroundColor: colors.darkmodeBlack,
    height: '100%',
  });
  const headerText = css({
    color: colors.darkmodeHighWhite,
    fontSize: '2em',
  });
  const subHeaderText = css({
    color: colors.darkmodeHighWhite,
    fontSize: '1.2em',
    fontWeight: 'lighter',
  });
  const inputStyle = css({
    WebkitAppearance: 'none',
    outline: 'none',
    border: '1px solid black',
    backgroundColor: colors.darkmodeLightBlack,

    margin: 4,
    padding: 10,
    borderRadius: 3,
  });
  const connectButton = css({
    margin: 4,
    padding: 8,
    borderRadius: 3,
    border: '1px solid black',
    fontWeight: 'bold',

    cursor: 'pointer',
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
    <div className={containerBg()}>
      <div className={[container(), 'clickable'].join(' ')}>
        <img
          src={messengerLogo}
          width={55}
          height={55}
          style={{ marginLeft: 'auto', marginRight: 'auto', paddingBottom: 30 }}
        />
        <h1 className={headerText()}>Messenger</h1>
        <h3 className={subHeaderText()}>Sign in with Facebook to connect.</h3>
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
          className={[inputStyle(), 'undraggable', 'clickable'].join(' ')}
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
          className={[inputStyle(), 'undraggable', 'clickable'].join(' ')}
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
          className={connectButton()}
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
