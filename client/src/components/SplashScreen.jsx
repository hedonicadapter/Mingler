import React, { useEffect, useState, useRef } from 'react';
import { css, styled } from '@stitches/react';
import * as electron from 'electron';
import { IoIosArrowBack } from 'react-icons/io';

import styles from './SplashScreen.module.css';
import { useAuth } from '../contexts/AuthContext';
import colors from '../config/colors';
import { AnimatePresence, motion } from 'framer-motion';
import MenuButton from './MenuButton';
import { useLocalStorage } from '../helpers/localStorageManager';
import { LoadingAnimation } from './reusables/LoadingAnimation';
import {
  getSettings,
  turnOffShowWelcomeMain,
} from '../mainState/features/settingsSlice';
import { useDispatch, useSelector } from 'react-redux';
import animations from '../config/animations';
import { useIsMounted } from '../helpers/useIsMounted';

const formFilledVariants = {
  true: {
    // backgroundColor: colors.coffeeBlue,
    opacity: 1,
    color: colors.darkmodeBlack,
    cursor: 'pointer',
  },
  false: {
    // backgroundColor: colors.darkmodeDisabledBlack,
    opacity: 0,
    color: colors.darkmodeDisabledText,
    cursor: 'auto',
  },
  loading: {
    // backgroundColor: colors.darkmodeDisabledBlack,
    // opacity:0
    color: colors.darkmodeDisabledText,
    cursor: 'auto',
  },
};

const Separator = () => {
  return <h6 className={styles.separator}>or</h6>;
};

const BackgroundNoise = () => {
  return (
    <svg
      id="svg"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        height: '100%',
        width: '100%',
        position: 'fixed',
        top: '0px',
        left: '0px',
        right: '0px',
        bottom: '0px',
        pointerEvents: 'none',
      }}
    >
      <defs>
        <filter id="noise" y="0" x="0">
          <feTurbulence
            className="basefrequency"
            stitchTiles="stitch"
            baseFrequency=".75"
            type="fractalNoise"
          />
        </filter>
        <pattern
          id="pattern"
          className="tile1"
          patternUnits="userSpaceOnUse"
          height="100"
          width="100"
          y="0"
          x="0"
        >
          <rect
            className="bg"
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="transparent"
          />
          <rect
            className="opacity"
            x="0"
            y="0"
            width="100%"
            height="100%"
            filter="url(#noise)"
            opacity=".55"
          />
        </pattern>
      </defs>
      <rect
        id="rect"
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="url(#pattern)"
      />
    </svg>
  );
};

const AnimationWrapper = ({ children }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.35,
        }}
        style={{
          marginInline: '10%',
        }}
        spellCheck="false"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

const BackButton = ({ slide, setSlide }) => {
  const handleBackButton = () => {
    slide !== 'init' && setSlide('init');
  };

  return (
    <motion.div
      whileHover={{
        cursor: slide !== 'init' && 'pointer',
      }}
      className={styles.backButtonStyle}
      style={{ opacity: slide === 'init' ? 0.2 : 1 }}
      onClick={handleBackButton}
    >
      <IoIosArrowBack size={24} color={colors.darkmodeLightBlack} />
    </motion.div>
  );
};

const ServiceSelector = ({ slides, setSlide }) => {
  const handleServiceButtonClick = (serviceSelection) => {
    setSlide(serviceSelection);
  };

  return (
    <AnimationWrapper>
      <motion.div
        whileHover={{
          borderTopColor: colors.darkmodeBlack,
          transition: { duration: 0.1 },
        }}
        whileTap={animations.whileTap}
        className={[
          styles.buttonStyle,
          // inputStyle(),
          styles.availableButtonStyle,
        ].join(' ')}
        // style={{ backgroundColor: colors.coffeePink }}
        style={{
          borderTop: '1px solid ' + colors.offWhitePressed2,
          margin: 'auto',
        }}
        onClick={() => handleServiceButtonClick('email')}
      >
        {'sign up with email'}
      </motion.div>
      {slides.map((service) => {
        if (
          service.title !== 'init' &&
          service.title !== 'email' &&
          service.title !== 'guest'
        ) {
          return (
            <motion.div
              key={service.key}
              whileHover={
                service.available && {
                  color: colors.darkmodeHighWhite,
                  transition: { duration: 0.1 },
                  borderTopColor: colors.darkmodeBlack,
                }
              }
              whileFocus={{
                color: service.available
                  ? colors.darkmodeBlack
                  : colors.darkmodeLightBlack,
              }}
              whileTap={service.available && animations.whileTap}
              className={[
                styles.buttonStyle,
                // inputStyle(),
                service.available
                  ? styles.availableButtonStyle
                  : styles.unavailableButtonStyle,
              ].join(' ')}
              disabled={service.available ? true : false}
              // style={{
              //   backgroundColor:
              //     service.title === 'guest' && colors.coffeeBrown,
              // }}
              style={{
                borderTop: service.available
                  ? '1px solid ' + colors.darkmodeBlack
                  : '1px solid ' + colors.offWhitePressed2,
              }}
              onClick={() =>
                service.available && handleServiceButtonClick(service.title)
              }
            >
              {'Sign up with ' + service.title}
            </motion.div>
          );
        }
      })}
      <Separator />
      <motion.div
        className={[styles.buttonStyle, styles.availableButtonStyle].join(' ')}
        whileHover={{
          color: colors.darkmodeBlack,
          transition: { duration: 0.1 },
          borderTopColor: colors.darkmodeBlack,
        }}
        whileFocus={{ color: colors.darkmodeBlack }}
        style={{ borderTop: '1px solid ' + colors.offWhitePressed2 }}
        whileTap={animations.whileTap}
        onClick={() => handleServiceButtonClick('guest')}
      >
        {'continue as guest '}
      </motion.div>
    </AnimationWrapper>
  );
};

const Slider = ({
  currentSlide,
  setSlide,
  justRegistered,
  setJustRegistered,
}) => {
  const slides = [
    { key: 0, title: 'init' },
    { key: 1, title: 'guest', available: true },
    { key: 2, title: 'discord', available: false },
    { key: 3, title: 'google', available: false },
    { key: 4, title: 'facebook', available: false },
    { key: 5, title: 'email' },
  ];

  return (
    <div className={styles.sliderContainer}>
      {currentSlide === 'init' && (
        <ServiceSelector slides={slides} setSlide={setSlide} />
      )}
      {currentSlide === 'guest' && <GuestSlide />}
      {currentSlide === 'email' && (
        <EmailSlide setSlide={setSlide} setJustRegistered={setJustRegistered} />
      )}
      {currentSlide === 'signIn' && (
        <SigninSlide justRegistered={justRegistered} />
      )}
      <Footer currentSlide={currentSlide} setSlide={setSlide} />
    </div>
  );
};

const GuestSlide = () => {
  const isMounted = useIsMounted();
  const [name, setName] = useState('');
  const [nameFieldFocused, setNameFieldFocused] = useState(true);
  const [formFilled, setFormFilled] = useState('false');
  const [error, setError] = useState(null);

  const { signInGuest, signUpGuest } = useAuth();

  useEffect(() => {
    console.log('signinguest ', error);
    const errorTimeout = setTimeout(() => setError(null), 3000);

    return () => clearTimeout(errorTimeout);
  }, [error]);

  useEffect(() => {
    if (!name) {
      setFormFilled('false');
    } else if (name) setFormFilled('true');
  }, [name]);

  const handleNameInput = (evt) => {
    setName(evt.target.value);
    validator();
  };

  const handleBackspaceAndEnter = (evt, fieldName) => {
    if (evt.key === 'Enter') {
      if (formFilled === 'true') handleContinueButton();
    } else if (evt.key === 'Delete' || evt.key === 'Backspace') {
      setName(evt.target.value);
      validator();
    }
  };

  const validator = () => {
    // if (name) {
    //   setFormFilled('true');
    // } else setFormFilled('false');
  };

  const handleContinueButton = () => {
    setFormFilled('loading');

    signUpGuest(name).then(({ success, _id, error }) => {
      if (error) {
        setError(error);
        setFormFilled('true');
      }
      if (success) {
        setError(null);
        signInGuest(_id).then(({ success, error }) => {
          setError(error);
          setFormFilled('true');
        });
      }
    });
  };

  return (
    <AnimationWrapper>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          borderTop: '1px solid ' + colors.offWhitePressed2,
        }}
      >
        <input
          disabled={formFilled === 'loading' ? true : false}
          placeholder="name"
          type="name"
          value={name || ''}
          onChange={handleNameInput}
          onKeyUp={(evt) => handleBackspaceAndEnter(evt)}
          className={[styles.inputStyle, 'undraggable', 'clickable'].join(' ')}
          style={{
            borderTop: name
              ? '1px solid ' + colors.darkmodeBlack
              : '1px solid ' + colors.offWhitePressed2,
            color:
              nameFieldFocused && name
                ? colors.darkmodeBlack
                : colors.darkmodeLightBlack,
          }}
          autoFocus={true}
          onFocus={() => {
            setNameFieldFocused(true);
          }}
          onBlur={() => {
            setNameFieldFocused(false);
          }}
        />
      </div>
      <div className={styles.guestSlideButtonsContainer}>
        <motion.div
          animate={formFilled}
          variants={formFilledVariants}
          whileTap={
            formFilled != 'false' &&
            formFilled != 'loading' &&
            !error &&
            animations.whileTap
          }
          className={styles.buttonStyle}
          style={{
            minWidth: '80px',
            opacity: 0,
            cursor: error ? 'default' : 'auto',
            marginRight: 0,
          }}
          onClick={() =>
            formFilled != 'false' &&
            formFilled != 'loading' &&
            !error &&
            handleContinueButton()
          }
        >
          {error ? (
            <div style={{ fontSize: '0.9em', color: colors.coffeeRed }}>
              {error}
            </div>
          ) : (
            <LoadingAnimation formFilled={formFilled} buttonText={'continue'} />
          )}
        </motion.div>
      </div>
    </AnimationWrapper>
  );
};

const EmailSlide = ({ setSlide, setJustRegistered }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(null);
  const [nameFieldFocused, setNameFieldFocused] = useState();
  const [emailFieldFocused, setEmailFieldFocused] = useState();
  const [passwordFieldFocused, setPasswordFieldFocused] = useState();
  const [formFilled, setFormFilled] = useState('false');
  const [error, setError] = useState(null);

  const { signUpWithEmail } = useAuth();

  useEffect(() => {
    const errorTimeout = setTimeout(() => setError(null), 3000);

    return () => clearTimeout(errorTimeout);
  }, [error]);

  useEffect(() => {
    if (!name || !email || !password) {
      setFormFilled('false');
    } else if (name && email && password) setFormFilled('true');
  }, [name, email, password]);

  const handleNameInput = (evt) => {
    setName(evt.target.value);
    validator();
  };

  const handleEmailInput = (evt) => {
    setEmail(evt.target.value);
    validator();
  };

  const handlePasswordInput = (evt) => {
    setPassword(evt.target.value);
    validator();
  };

  const handleBackspaceAndEnter = (evt, fieldName) => {
    if (evt.key === 'Enter') {
      if (formFilled === 'true') handleSignUpButton();
    } else if (evt.key === 'Delete' || evt.key === 'Backspace') {
      if (fieldName === 'email') {
        setEmail(evt.target.value);
      } else if (fieldName === 'password') {
        setPassword(evt.target.value);
      } else if (fieldName === 'name') {
        setName(evt.target.value);
      }
      validator();
    }
  };

  const validator = () => {
    // if (name && email && password) {
    //   setFormFilled('true');
    // } else setFormFilled('false');
  };

  const handleSignUpButton = () => {
    setFormFilled('loading');

    signUpWithEmail(name, email, password).then(({ success, email, error }) => {
      if (error) {
        setError(error);
        setFormFilled('true');
      }
      if (success) {
        setJustRegistered({ email, password });
        error && setError(null);
        setSlide('signIn');
      }
    });
  };

  return (
    <AnimationWrapper>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <input
          disabled={formFilled === 'loading' ? true : false}
          placeholder="name"
          type="name"
          value={name || ''}
          onChange={handleNameInput}
          onKeyUp={(evt) => handleBackspaceAndEnter(evt, 'name')}
          className={[styles.inputStyle, 'undraggable', 'clickable'].join(' ')}
          style={{
            borderTop: name
              ? '1px solid ' + colors.darkmodeBlack
              : '1px solid ' + colors.offWhitePressed2,
            color:
              nameFieldFocused && name
                ? colors.darkmodeBlack
                : colors.darkmodeLightBlack,
          }}
          autoFocus={true}
          onFocus={() => {
            setNameFieldFocused(true);
          }}
          onBlur={() => {
            setNameFieldFocused(false);
          }}
        />
        <input
          disabled={formFilled === 'loading' ? true : false}
          placeholder="email adress"
          type="email"
          value={email || ''}
          onChange={handleEmailInput}
          onKeyUp={(evt) => handleBackspaceAndEnter(evt, 'email')}
          className={[styles.inputStyle, 'undraggable', 'clickable'].join(' ')}
          style={{
            borderTop: email
              ? '1px solid ' + colors.darkmodeBlack
              : '1px solid ' + colors.offWhitePressed2,
            color:
              emailFieldFocused && email
                ? colors.darkmodeBlack
                : colors.darkmodeLightBlack,
          }}
          onFocus={() => {
            setEmailFieldFocused(true);
          }}
          onBlur={() => {
            setEmailFieldFocused(false);
          }}
        />
        <input
          disabled={formFilled === 'loading' ? true : false}
          placeholder="password"
          type="password"
          value={password || ''}
          onChange={handlePasswordInput}
          onKeyUp={(evt) => handleBackspaceAndEnter(evt, 'password')}
          className={[styles.inputStyle, 'undraggable', 'clickable'].join(' ')}
          style={{
            borderTop: password
              ? '1px solid ' + colors.darkmodeBlack
              : '1px solid ' + colors.offWhitePressed2,
            color:
              passwordFieldFocused && password
                ? colors.darkmodeBlack
                : colors.darkmodeLightBlack,
          }}
          onFocus={() => {
            setPasswordFieldFocused(true);
          }}
          onBlur={() => {
            setPasswordFieldFocused(false);
          }}
        />
      </div>
      <div className={styles.emailSlideButtonsContainer}>
        <motion.div
          animate={formFilled}
          variants={formFilledVariants}
          whileTap={
            formFilled != 'false' &&
            formFilled != 'loading' &&
            animations.whileTap
          }
          className={styles.buttonStyle}
          style={{ minWidth: '80px', opacity: 0 }}
          onClick={() =>
            formFilled != 'false' &&
            formFilled != 'loading' &&
            handleSignUpButton()
          }
        >
          {error ? (
            <div style={{ fontSize: '0.9em', color: colors.coffeeRed }}>
              {error}
            </div>
          ) : (
            <LoadingAnimation formFilled={formFilled} buttonText={'sign up!'} />
          )}
        </motion.div>
      </div>
    </AnimationWrapper>
  );
};

const SigninSlide = ({ justRegistered }) => {
  const emailInput = useRef(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState('');
  const [emailFieldFocused, setEmailFieldFocused] = useState(true);
  const [passwordFieldFocused, setPasswordFieldFocused] = useState(false);
  const [formFilled, setFormFilled] = useState('false');
  const [error, setError] = useState(null);
  const [keepMeSignedIn, setKeepMeSignedIn] = useState(true);

  const { signIn } = useAuth();

  const signInOptions = [
    { key: 0, title: 'Discord', available: false },
    { key: 1, title: 'Google', available: false },
    { key: 2, title: 'Facebook', available: false },
  ];

  useEffect(() => {
    const errorTimeout = setTimeout(() => setError(null), 3000);

    return () => clearTimeout(errorTimeout);
  }, [error]);

  useEffect(() => {
    if (justRegistered) {
      setEmail(justRegistered.email);
      setPassword(justRegistered.password);
    }
  }, []);

  useEffect(() => {
    emailInput?.current?.focus(); //TODO: this and autoFocus not working
  }, [emailInput]);

  useEffect(() => {
    if (!email || !password) {
      setFormFilled('false');
    } else if (email && password) setFormFilled('true');
  }, [email, password]);

  const handleEmailInput = (evt) => {
    setEmail(evt.target.value);
    validator();
    return;
  };

  const handlePasswordInput = (evt) => {
    setPassword(evt.target.value);
    validator();
    return;
  };

  const handleBackspaceAndEnter = (evt, fieldName) => {
    if (evt.key === 'Enter') {
      if (formFilled === 'true') handleSignInButton();
    } else if (evt.key === 'Delete' || evt.key === 'Backspace') {
      if (fieldName === 'email') {
        setEmail(evt.target.value);
      } else if (fieldName === 'password') {
        setPassword(evt.target.value);
      }
      validator();
    }
  };

  const handleSignInButton = () => {
    setFormFilled('loading');

    signIn(email, password, keepMeSignedIn).then(({ success, error }) => {
      if (error) {
        setError(error);
        setFormFilled('true');
      }
      if (success) {
        setError(null);
      }
    });
  };

  const toggleKeepMeSignedIn = () => {
    setKeepMeSignedIn(!keepMeSignedIn);
  };

  const validator = () => {
    // if (name && email && password) {
    //   setFormFilled('true');
    // } else setFormFilled('false');
  };

  return (
    <AnimationWrapper>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <input
          ref={emailInput}
          autoFocus={true}
          disabled={formFilled === 'loading' ? true : false}
          placeholder="email address"
          type="email"
          value={email || ''}
          onChange={handleEmailInput}
          onKeyUp={(evt) => handleBackspaceAndEnter(evt, 'email')}
          className={[styles.inputStyle, 'undraggable', 'clickable'].join(' ')}
          style={{
            borderTop: email
              ? '1px solid ' + colors.darkmodeBlack
              : '1px solid ' + colors.offWhitePressed2,
            color:
              emailFieldFocused && email
                ? colors.darkmodeBlack
                : colors.darkmodeLightBlack,
          }}
          onFocus={() => {
            setEmailFieldFocused(true);
          }}
          onBlur={() => {
            setEmailFieldFocused(false);
          }}
        />
        <input
          disabled={formFilled === 'loading' ? true : false}
          placeholder="password"
          type="password"
          value={password || ''}
          onChange={handlePasswordInput}
          onKeyUp={(evt) => handleBackspaceAndEnter(evt, 'password')}
          className={[styles.inputStyle, 'undraggable', 'clickable'].join(' ')}
          style={{
            borderTop: password
              ? '1px solid ' + colors.darkmodeBlack
              : '1px solid ' + colors.offWhitePressed2,
            color:
              passwordFieldFocused && password
                ? colors.darkmodeBlack
                : colors.darkmodeLightBlack,
          }}
          onFocus={() => {
            setPasswordFieldFocused(true);
          }}
          onBlur={() => {
            setPasswordFieldFocused(false);
          }}
        />
      </div>
      <div className={styles.checkboxAndSignInButtonContainer}>
        <div
          onClick={toggleKeepMeSignedIn}
          className={styles.keepMeSignedInContainer}
        >
          <input
            type="checkbox"
            name="keepMeSignedIn"
            checked={keepMeSignedIn}
            onChange={() => {}}
            className={styles.keeepMeSignedInCheckboxStyle}
          />
          <label
            className={styles.keeepMeSignedInLabelStyle}
            style={{
              color: keepMeSignedIn
                ? colors.darkmodeLightBlack
                : colors.defaultPlaceholderTextColor,
            }}
            htmlFor="keepMeSignedIn"
          >
            &nbsp;keep me signed in
          </label>
        </div>
        <motion.div
          animate={formFilled}
          variants={formFilledVariants}
          whileTap={
            formFilled != 'false' &&
            formFilled != 'loading' &&
            animations.whileTap
          }
          style={{
            minWidth: '60px',
            opacity: 0,
            paddingRight: 12,
            alignSelf: 'center',
            fontSize: '0.8em',
            opacity: formFilled === 'false' ? 0 : 1,
          }}
          // formFilled={formFilled}
          onClick={() =>
            formFilled != 'false' &&
            formFilled != 'loading' &&
            handleSignInButton()
          }
        >
          {error ? (
            <div style={{ fontSize: '0.9em', color: colors.coffeeRed }}>
              {error}
            </div>
          ) : (
            <LoadingAnimation formFilled={formFilled} buttonText={'sign in'} />
          )}
        </motion.div>
      </div>
      <Separator />
      {signInOptions.map((option) => {
        return (
          <motion.div
            key={option.key}
            whileHover={option.available && { color: colors.darkmodeHighWhite }}
            whileTap={option.available && animations.whileTap}
            className={[
              styles.buttonStyle,
              option.available
                ? styles.availableButtonStyle
                : styles.unavailableButtonStyle,
            ].join(' ')}
            onClick={
              () => {}
              // option.available && handleoptionButtonClick(option.title)
            }
          >
            {'sign in with ' + option.title}
          </motion.div>
        );
      })}
    </AnimationWrapper>
  );
};

const Header = ({ showWelcome, slide, setSlide }) => {
  return (
    <div className={styles.header}>
      <BackButton slide={slide} setSlide={setSlide} />
      {showWelcome ? (
        <>
          <h4 style={{ margin: 0, padding: 0 }}>
            Welcome to <h1>Mingler</h1>
          </h4>
        </>
      ) : (
        <h1>Mingler</h1>
      )}
      <div style={{ opacity: 0, pointerEvents: 'none' }}>
        <BackButton slide={slide} setSlide={setSlide} />
      </div>
    </div>
  );
};

const Footer = ({ currentSlide, setSlide }) => {
  const handleAlreadyAMemberButton = () => {
    setSlide('signIn');
  };

  const handleNotAMemberButton = () => {
    setSlide('init');
  };

  const Prompt = ({
    handleAlreadyAMemberButton,
    handleNotAMemberButton,
    children,
  }) => {
    return (
      <motion.div
        className={styles.footerLink}
        whileHover={{
          textDecorationColor: colors.coffeeOrange,
          transition: { duration: 0.15 },
        }}
        onClick={handleAlreadyAMemberButton || handleNotAMemberButton}
      >
        {children}
      </motion.div>
    );
  };

  const AlreadyAMember = () => {
    return (
      <>
        already a member?&nbsp;
        <Prompt handleAlreadyAMemberButton={handleAlreadyAMemberButton}>
          sign in
        </Prompt>
      </>
    );
  };

  const NotAMember = () => {
    return (
      <>
        not a member yet?&nbsp;
        <Prompt handleNotAMemberButton={handleNotAMemberButton}>
          sign up!
        </Prompt>
      </>
    );
  };

  return (
    <motion.div className={styles.footer}>
      {currentSlide !== 'signIn' && <AlreadyAMember />}
      {currentSlide === 'signIn' && <NotAMember />}
    </motion.div>
  );
};

export default function SplashScreen() {
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [slide, setSlide] = useState('init');
  // const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [justRegistered, setJustRegistered] = useLocalStorage('justRegistered');
  const appSettings = useSelector(getSettings);
  const dispatch = useDispatch();

  const inputRef = useRef();

  useEffect(() => {
    inputRef?.current?.focus();
  }, [inputRef?.current]);

  // Set new user status to false on unmount
  // so an experienced user is not met with
  // the same welcome screen
  useEffect(() => {
    if (currentUser) setSlide('SignIn');

    return () => {
      // turn off welcome splash/header when user gets past splash screen for the first time
      dispatch(turnOffShowWelcomeMain());
      setJustRegistered(null);
    };
  }, []);

  return (
    <div className={styles.container} style={{ height: window.innerHeight }}>
      <div style={{ zIndex: 1 }}>
        <MenuButton />
        <Header
          showWelcome={appSettings.showWelcome}
          slide={slide}
          setSlide={setSlide}
        />

        <Slider
          currentSlide={slide}
          setSlide={setSlide}
          justRegistered={justRegistered}
          setJustRegistered={setJustRegistered}
        />
      </div>
      <BackgroundNoise />
    </div>
  );
}
