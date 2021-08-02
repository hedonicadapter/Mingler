import React, { useEffect, useState, useRef } from 'react';
import { css, styled } from '@stitches/react';
import * as electron from 'electron';

import { useAuth } from '../contexts/AuthContext';
import colors from '../config/colors';
import { AnimatePresence, motion } from 'framer-motion';
import MenuButton from './MenuButton';

const StyledInput = styled('input', {
  WebkitAppearance: 'none',
  outline: 'none',
  border: 'none',

  backgroundColor: colors.depressedWhite,
  padding: 10,
  // borderRadius: '50% / 10%',
  position: 'relative',
  // width: '200px',
  // height: '150px',
  // margin: '20px 10px',
  borderRadius: '40% / 15%',
  // width: '40%',

  '&::before': {
    position: 'absolute',
    width: '120%',
    top: '10%',
    bottom: '10%',
    background: 'inherit',
    borderRadius: '30% / 45%',
  },

  variants: {
    focus: {
      true: {},
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
const continueButtonStyle = css({
  width: '84%',
  textAlign: 'right',
  padding: 6,
  fontSize: '0.8em',
  fontWeight: 700,
});

export default function WelcomePane({}) {
  const { currentUser, nameNewAccount, anonymousLogin } = useAuth();
  const [userName, setUserName] = useState(null);
  const [inputFocus, setInputFocus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  const inputRef = useRef();

  useEffect(() => {
    inputRef?.current?.focus();
  }, [inputRef?.current]);

  const inputFocusToggle = (evt) => {
    setInputFocus(!inputFocus);
  };

  const handleNameChange = (evt) => {
    setUserName(evt.target.value);
  };

  const handleContinueClick = () => {
    setLoading(true);
    nameNewAccount(userName).then(({ registered = null }) => {
      if (registered) {
        anonymousLogin().then((result) => {
          setShowSuccessScreen(true);
          // setTimeout(()=>setShowSuccessScreen(false),)
        });
      }
      if (!registered) {
        console.log('not registered');
        // Something went wrong, please try again.
      }
    });
  };

  const WelcomeToShareHubScreen = () => {
    return (
      <>
        <MenuButton />
        <h2>
          Welcome to <h1>ShareHub!</h1>
        </h2>
        <p>What do we call you?</p>

        <StyledInput
          placeholder="..."
          ref={inputRef}
          onBlur={() => {
            setInputFocus(true);
            inputRef?.current?.focus();
          }}
          onChange={handleNameChange}
          focus={inputFocus}
          value={userName}
          type="text"
          spellCheck={false}
        />
        <motion.div
          animate={userName ? 'show' : 'hide'}
          variants={{
            show: { color: 'rgba(41,41,41)' },
            hide: { color: 'rgba(241,235,232)' },
          }}
          transition={{ duration: 0.25 }}
          onClick={() => userName && handleContinueClick()}
          className={continueButtonStyle()}
        >
          {loading ? <div className="dotter" /> : 'continue'}
        </motion.div>
      </>
    );
  };

  const PostRegistrationScreen = () => {
    return (
      <motion.div
        style={{
          height: window.innerHeight,
          width: window.innerWidth,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        initial={{
          x: '120%',
          opacity: 0,
          backgroundColor: 'rgba(0,0,0,0)',
        }}
        animate={{
          x: '0%',
          opacity: 1,
          backgroundColor: 'rgba(0,0,0,1)',
        }}
        transition={{ duration: 0.35 }}
      >
        <h1>Here we go.</h1>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div className={container()}>
        <div className={welcomeText()}>
          {!showSuccessScreen ? (
            <WelcomeToShareHubScreen />
          ) : (
            <PostRegistrationScreen />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
