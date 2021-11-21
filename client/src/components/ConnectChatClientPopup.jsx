import { css, styled } from '@stitches/react';
import React, { useState, useEffect } from 'react';
import colors from '../config/colors';
import DAO from '../config/DAO';
import { motion } from 'framer-motion';

const ipcRenderer = require('electron').ipcRenderer;

// TODO:
// use a proper redirect uri
export default function ConnectChatClientPopup() {
  const [chosenClient, setChosenClient] = useState();
  const [emailOrPhone, setEmailOrPhone] = useState();
  const [password, setPassword] = useState();
  const [emailOrPhoneFieldFocused, setEmailOrPhoneFieldFocused] = useState();
  const [passwordFieldFocused, setPasswordFieldFocused] = useState();
  const [formFilled, setFormFilled] = useState(false);

  ipcRenderer.once('chosenClient', (event, value) => {
    const { chosenClient, email } = value;

    setChosenClient(chosenClient);
    setEmailOrPhone(email);
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
  const ConnectButton = styled('div', {
    margin: 4,
    padding: 8,
    borderRadius: 3,
    border: '1px solid black',
    fontWeight: 'bold',

    variants: {
      formFilled: {
        true: {
          backgroundColor: colors.samBlue,
          color: colors.darkmodeHighWhite,
        },
        false: {
          backgroundColor: colors.darkmodeDisabledBlack,
          color: colors.darkmodeDisabledText,
        },
      },
    },
  });

  const handleEmailInput = (evt) => {
    setEmailOrPhone(evt.target.value);
    validator();
  };
  const handlePasswordInput = (evt) => {
    setPassword(evt.target.value);
    validator();
  };
  const handleBackspace = (evt, fieldName) => {
    if (evt.key === 'Delete' || evt.key === 'Backspace') {
      if (fieldName === 'emailOrPhone') {
        setEmailOrPhone(evt.target.value);
      } else if (fieldName === 'password') {
        setPassword(evt.target.value);
      }
      validator();
    }
  };

  const validator = () => {
    if (emailOrPhone && password) {
      setFormFilled(true);
    } else setFormFilled(false);
  };

  return (
    <div className={containerBg()}>
      <div className={[container(), 'clickable'].join(' ')}>
        icon
        <h1 className={headerText()}>Messenger</h1>
        <h3 className={subHeaderText()}>
          Sign in with Facebook to get started.
        </h3>
        <input
          placeholder="Email adress or phone number"
          type="email"
          value={emailOrPhone || ''}
          onChange={handleEmailInput}
          onKeyUp={(evt) => handleBackspace(evt, 'emailOrPhone')}
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
          placeholder="Password"
          type="password"
          value={password || ''}
          onChange={handlePasswordInput}
          onKeyUp={(evt) => handleBackspace(evt, 'password')}
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
        <ConnectButton formFilled={formFilled}>Connect</ConnectButton>
        keep me signed in
      </div>
    </div>
  );
}
