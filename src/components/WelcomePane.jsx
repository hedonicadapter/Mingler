import React, { useEffect, useState } from 'react';
import { css, styled } from '@stitches/react';

import { useAuth } from '../contexts/AuthContext';
import colors from '../config/colors';
import { AnimatePresence, motion } from 'framer-motion';

const StyledInput = styled('input', {
  WebkitAppearance: 'none',
  outline: 'none',
  border: 'none',

  padding: 10,

  variants: {
    focus: {
      true: {
        backgroundColor: colors.depressedWhite,

        borderRadius: 1,
      },
      false: {
        backgroundColor: 'transparent',
      },
    },
  },
});

const container = css({
  pointerEvents: 'auto',
  backgroundColor: colors.classyWhite,
  height: window.innerHeight,

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
});
const welcomeText = css({
  textAlign: 'center',
  paddingInline: 20,
});

export default function WelcomePane({}) {
  const { currentUser, nameNewAccount } = useAuth();
  const [userName, setUserName] = useState();
  const [inputFocus, setInputFocus] = useState();

  const inputFocusToggle = (evt) => {
    setInputFocus(!inputFocus);
  };

  const handleNameChange = (evt) => {
    setUserName(evt.target.value);
    // setName(evt.target.value);
  };

  const handleContinueClick = () => {
    nameNewAccount();
  };

  return (
    <div className={container()}>
      <div className={welcomeText()}>
        <h2>
          Welcome to <h1>ShareHub!</h1>
        </h2>
        <p>What do we call you?</p>
      </div>
      <StyledInput
        placeholder="..."
        focus
        onFocus={inputFocusToggle}
        onBlur={inputFocusToggle}
        onChange={handleNameChange}
        focus={inputFocus}
        value={userName}
        type="text"
        spellCheck={false}
      />
      <AnimatePresence>
        {userName && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleContinueClick()}
          >
            continue
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
