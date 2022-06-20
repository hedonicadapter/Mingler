import { css, styled } from '@stitches/react';
import React, { useState } from 'react';
import colors from '../config/colors';
import { motion } from 'framer-motion';

const inputStyle = css({
  WebkitAppearance: 'none',
  outline: 'none',
  border: '1px solid black',
  backgroundColor: colors.darkmodeLightBlack,

  margin: 4,
  padding: 10,
  borderRadius: 3,
});

export default function InputFields({ buttonsArray }) {
  const [formFilled, setFormFilled] = useState(null);

  const EmailField = () => {
    const [email, setEmail] = useState(null);
    const [emailFieldFocused, setEmailFieldFocused] = useState();

    const handlePasswordInput = () => {
      return;
    };

    const handleSubmit = () => {
      return;
    };

    const handleBackspaceAndEnter = (evt, fieldName) => {
      if (evt.key === 'Enter') {
        if (formFilled === 'true') handleSubmit();
      } else if (evt.key === 'Delete' || evt.key === 'Backspace') {
        setEmail(evt.target.value);
      }
    };

    return (
      <input
        disabled={formFilled === 'loading' ? true : false}
        placeholder="Email adress or phone number"
        type="email"
        value={email}
        onChange={handleEmailInput}
        onKeyUp={(evt) => handleBackspaceAndEnter(evt, 'emailOrPhone')}
        className={[inputStyle(), 'undraggable', 'clickable'].join(' ')}
        style={{
          color:
            emailFieldFocused && email
              ? colors.darkmodeHighWhite
              : colors.darkmodeMediumWhite,
        }}
        autoFocus={true}
        onFocus={() => {
          setEmailFieldFocused(true);
        }}
        onBlur={() => {
          setEmailFieldFocused(false);
        }}
      />
    );
  };

  const PasswordField = () => {
    const [password, setPassword] = useState(null);
    const [passwordFieldFocused, setPasswordFieldFocused] = useState();

    const handlePasswordInput = () => {
      return;
    };

    const handleSubmit = () => {
      return;
    };

    const handleBackspaceAndEnter = (evt, fieldName) => {
      if (evt.key === 'Enter') {
        if (formFilled === 'true') handleSubmit();
      } else if (evt.key === 'Delete' || evt.key === 'Backspace') {
        setPassword(evt.target.value);
      }
    };

    return (
      <input
        disabled={formFilled === 'loading' ? true : false}
        placeholder="Password"
        type="password"
        value={password}
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
    );
  };
}
