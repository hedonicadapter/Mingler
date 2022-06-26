import React, { useEffect, useState, useRef } from 'react';
import { css, styled } from '@stitches/react';
import * as electron from 'electron';
import { IoIosArrowBack } from 'react-icons/io';

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
import { notify } from './reusables/notifications';

const container = css({
  pointerEvents: 'auto',
  backgroundColor: colors.offWhite,
  height: window.innerHeight,

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
});
const header = css({
  fontFamily: 'Times New Roman',
  fontSize: '1.2em',
  textAlign: 'center',
  textTransform: 'uppercase',
  // paddingInline: 20,
  paddingBottom: 22,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
});

const inputStyle = css({
  transition: 'border-top 0.15s ease',

  border: 'none',
  outline: 'none',
  resize: 'none',
  backgroundColor: 'transparent',
  paddingTop: 14,
  paddingBottom: 14,
  paddingLeft: 6,
  marginLeft: 4,
  marginRight: 4,
  color: colors.darkmodeBlack,
  flex: 1,
});

const Separator = styled('h6', {
  display: 'flex',
  flexDirection: 'row',
  paddingInline: '2%',
  color: colors.darkmodeLightBlack,
  opacity: 0.2,

  '&:before': {
    // height: 1,
    content: '',
    flex: '1 1',
    // borderTop: '1px solid ' + colors.darkmodeBlack,
    borderBottom: '1px solid ' + colors.darkmodeBlack,
    margin: 'auto',
    marginRight: '14px',
  },
  '&:after': {
    // height: 1,
    content: '',
    flex: '1 1',
    // borderTop: '1px solid ' + colors.darkmodeBlack,
    borderBottom: '1px solid ' + colors.darkmodeBlack,
    margin: 'auto',
    marginLeft: '14px',
  },
});

const buttonStyle = css({
  padding: 10,
  textAlign: 'left',
  fontSize: '0.8em',
  maxWidth: '72%',
  margin: 'auto',
  // margin: 'auto',

  // fontStyle: 'italic',

  // borderRadius: 2,
  // border: '1px solid black',
});

const availableButtonStyle = css({
  color: colors.darkmodeLightBlack,
  // backgroundColor: colors.coffeeBlue,
  cursor: 'pointer',
});

const unavailableButtonStyle = css({
  color: colors.offWhitePressed2,
  // backgroundColor: colors.darkmodeDisabledBlack,
  cursor: 'auto',
});

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

export default function SplashScreen() {
  const { currentUser, signInGuest, signUpGuest, signUpWithEmail, signIn } =
    useAuth();

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
    };
  }, []);

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

  const BackButton = () => {
    const handleBackButton = () => {
      slide !== 'init' && setSlide('init');
    };

    const backButton = css({
      display: 'flex',
      paddingInline: 8,
      flexDirection: 'row',
      alignContent: 'center',
      alignItems: 'center',
      fontWeight: 'bold',
      fontSize: '0.6em',
      transition: 'opacity 0.15s ease',
      opacity: slide === 'init' ? 0.2 : 1,
    });

    return (
      <motion.div
        whileHover={{
          cursor: slide !== 'init' && 'pointer',
        }}
        className={backButton()}
        onClick={handleBackButton}
      >
        <IoIosArrowBack size={24} color={colors.darkmodeLightBlack} />
      </motion.div>
    );
  };

  const Slider = () => {
    const container = css({
      textAlign: 'center',
      paddingInline: 20,
      width: '100vw',
    });

    const handleServiceButtonClick = (serviceSelection) => {
      setSlide(serviceSelection);
    };

    const slides = [
      { key: 0, title: 'init' },
      { key: 1, title: 'guest', available: true },
      { key: 2, title: 'discord', available: false },
      { key: 3, title: 'google', available: false },
      { key: 4, title: 'facebook', available: false },
      { key: 5, title: 'email' },
    ];

    const ServiceSelector = () => {
      return (
        <AnimationWrapper>
          <motion.div
            whileHover={{
              borderTopColor: colors.darkmodeBlack,
              transition: { duration: 0.1 },
            }}
            whileTap={animations.whileTap}
            className={[
              buttonStyle(),
              // inputStyle(),
              availableButtonStyle(),
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
                    buttonStyle(),
                    // inputStyle(),
                    service.available
                      ? availableButtonStyle()
                      : unavailableButtonStyle(),
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
          <Separator>or</Separator>
          <motion.div
            className={[buttonStyle(), availableButtonStyle()].join(' ')}
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

    return (
      <div className={container()}>
        {slide === 'init' && <ServiceSelector />}
        {slide === 'guest' && <GuestSlide />}
        {slide === 'email' && <EmailSlide />}
        {slide === 'signIn' && <SigninSlide />}
        <Footer />
      </div>
    );
  };

  const GuestSlide = () => {
    const isMounted = useIsMounted();
    const [name, setName] = useState('');
    const [nameFieldFocused, setNameFieldFocused] = useState(true);
    const [formFilled, setFormFilled] = useState('false');
    const [error, setError] = useState(null);

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
            console.log('allo ', success, error); // prints the correct error message
            setError(error);
            setFormFilled('true');
          });
        }
      });
    };

    const buttonsContainer = css({
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-end',
    });

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
            className={[inputStyle(), 'undraggable', 'clickable'].join(' ')}
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
        <div className={buttonsContainer()}>
          <motion.div
            animate={formFilled}
            variants={formFilledVariants}
            whileTap={
              formFilled != 'false' &&
              formFilled != 'loading' &&
              !error &&
              animations.whileTap
            }
            className={buttonStyle()}
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
              <LoadingAnimation
                formFilled={formFilled}
                buttonText={'continue'}
              />
            )}
          </motion.div>
        </div>
      </AnimationWrapper>
    );
  };

  const EmailSlide = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(null);
    const [nameFieldFocused, setNameFieldFocused] = useState();
    const [emailFieldFocused, setEmailFieldFocused] = useState();
    const [passwordFieldFocused, setPasswordFieldFocused] = useState();
    const [formFilled, setFormFilled] = useState('false');
    const [error, setError] = useState(null);

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

      signUpWithEmail(name, email, password).then(
        ({ success, email, error }) => {
          if (error) {
            setError(error);
            setFormFilled('true');
          }
          if (success) {
            setJustRegistered({ email, password });
            error && setError(null);
            setSlide('signIn');
          }
        }
      );
    };

    const buttonsContainer = css({
      float: 'right',
      // display: 'flex',
      // flexDirection: 'row',
      // // justifyContent: 'end',
      // alignContent: 'end',
    });

    return (
      <AnimationWrapper>
        <div
          style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
        >
          <input
            disabled={formFilled === 'loading' ? true : false}
            placeholder="name"
            type="name"
            value={name || ''}
            onChange={handleNameInput}
            onKeyUp={(evt) => handleBackspaceAndEnter(evt, 'name')}
            className={[inputStyle(), 'undraggable', 'clickable'].join(' ')}
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
            className={[inputStyle(), 'undraggable', 'clickable'].join(' ')}
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
            className={[inputStyle(), 'undraggable', 'clickable'].join(' ')}
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
        <div className={buttonsContainer()}>
          <motion.div
            animate={formFilled}
            variants={formFilledVariants}
            whileTap={
              formFilled != 'false' &&
              formFilled != 'loading' &&
              animations.whileTap
            }
            className={buttonStyle()}
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
              <LoadingAnimation
                formFilled={formFilled}
                buttonText={'sign up!'}
              />
            )}
          </motion.div>
        </div>
      </AnimationWrapper>
    );
  };

  const SigninSlide = () => {
    const emailInput = useRef(null);
    const [email, setEmail] = useState(currentUser?.email || '');
    const [password, setPassword] = useState('');
    const [emailFieldFocused, setEmailFieldFocused] = useState(true);
    const [passwordFieldFocused, setPasswordFieldFocused] = useState(false);
    const [formFilled, setFormFilled] = useState('false');
    const [error, setError] = useState(null);
    const [keepMeSignedIn, setKeepMeSignedIn] = useState(true);

    useEffect(() => {
      const errorTimeout = setTimeout(() => setError(null), 3000);

      return () => clearTimeout(errorTimeout);
    }, [error]);

    useEffect(() => {
      notify('hello', 'no');

      if (justRegistered) {
        setEmail(justRegistered.email);
        setPassword(justRegistered.password);
      }

      // TODO: Surely it's ok to just store the password client-side momentarily
      return () => setJustRegistered(null);
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
        console.log('allo ');
        if (error) {
          console.log('allo error');
          setError(error);
          setFormFilled('true');
        }
        if (success) {
          console.log('allo success');
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

    const signInOptions = [
      { key: 0, title: 'Discord', available: false },
      { key: 1, title: 'Google', available: false },
      { key: 2, title: 'Facebook', available: false },
    ];

    const keepMeSignedInContainer = css({
      padding: 2,
      display: 'flex',
      justifyContent: 'flex-start',
      fontSize: '0.8em',
    });

    const keeepMeSignedInCheckboxStyle = css({
      // color: colors.darkmodeLightBlack,
    });
    const keeepMeSignedInLabelStyle = css({
      // color: 'light gray',
      color: keepMeSignedIn
        ? colors.darkmodeLightBlack
        : colors.defaultPlaceholderTextColor,
    });

    const checkboxAndSignInButtonContainer = css({
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    });

    return (
      <AnimationWrapper>
        <div
          style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
        >
          <input
            ref={emailInput}
            autoFocus={true}
            disabled={formFilled === 'loading' ? true : false}
            placeholder="email address"
            type="email"
            value={email || ''}
            onChange={handleEmailInput}
            onKeyUp={(evt) => handleBackspaceAndEnter(evt, 'email')}
            className={[inputStyle(), 'undraggable', 'clickable'].join(' ')}
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
            className={[inputStyle(), 'undraggable', 'clickable'].join(' ')}
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
        <div className={checkboxAndSignInButtonContainer()}>
          <div
            onClick={toggleKeepMeSignedIn}
            className={keepMeSignedInContainer()}
          >
            <input
              type="checkbox"
              name="keepMeSignedIn"
              checked={keepMeSignedIn}
              onChange={() => {}}
              className={keeepMeSignedInCheckboxStyle()}
            />
            <label
              className={keeepMeSignedInLabelStyle()}
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
              <LoadingAnimation
                formFilled={formFilled}
                buttonText={'sign in'}
              />
            )}
          </motion.div>
        </div>
        <Separator>or</Separator>
        {signInOptions.map((option) => {
          return (
            <motion.div
              key={option.key}
              whileHover={
                option.available && { color: colors.darkmodeHighWhite }
              }
              whileTap={option.available && animations.whileTap}
              className={[
                buttonStyle(),
                option.available
                  ? availableButtonStyle()
                  : unavailableButtonStyle(),
              ].join(' ')}
              onClick={() =>
                option.available && handleoptionButtonClick(option.title)
              }
            >
              {'sign in with ' + option.title}
            </motion.div>
          );
        })}
      </AnimationWrapper>
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

  const Header = () => {
    return (
      <div className={header()}>
        <BackButton />
        {appSettings.showWelcome ? (
          <>
            <h4 style={{ margin: 0, padding: 0 }}>
              Welcome to <h1>Mingler</h1>
            </h4>
          </>
        ) : (
          <h1>Mingler</h1>
        )}
        <div style={{ opacity: 0, pointerEvents: 'none' }}>
          <BackButton />
        </div>
      </div>
    );
  };

  const Footer = () => {
    const footer = css({
      position: 'absolute',
      bottom: 0,
      padding: 8,
      fontSize: '0.9em',
      display: 'flex',
      flexDireciton: 'row',
      justifyContent: 'center',
      letterSpacing: '1px',
      width: '100vw',
      // justifyContent:'',
    });

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
      const footerLink = css({
        textDecoration: 'underline',
        textDecorationColor: 'transparent',
        cursor: 'pointer',
        color: colors.coffeeGreen,
      });

      return (
        <motion.div
          className={footerLink()}
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
      <motion.div className={footer()}>
        {slide !== 'signIn' && <AlreadyAMember />}
        {slide === 'signIn' && <NotAMember />}
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div className={container()}>
        <div style={{ zIndex: 1 }}>
          <MenuButton />
          <Header />

          <Slider />
          {/* <PostRegistrationScreen /> */}
        </div>
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
      </motion.div>
    </AnimatePresence>
  );
}
