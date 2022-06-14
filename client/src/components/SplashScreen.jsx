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
  fontSize: '1.4em',
  textAlign: 'center',
  // paddingInline: 20,
  paddingBottom: 14,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
});

const buttonStyle = css({
  margin: 4,
  padding: 10,
  textAlign: 'left',
  fontSize: '0.8em',

  borderRadius: 2,
  // border: '1px solid black',
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

const Separator = styled('h5', {
  display: 'flex',
  flexDirection: 'row',
  paddingInline: '10%',
  color: colors.darkmodeDisabledText,
  opacity: 0.2,

  '&:before': {
    content: '',
    flex: '1 1',
    borderBottom: '1px solid ' + colors.darkmodeDisabledText,
    margin: 'auto',
    marginRight: '10px',
  },
  '&:after': {
    content: '',
    flex: '1 1',
    borderBottom: '1px solid ' + colors.darkmodeDisabledText,
    margin: 'auto',
    marginLeft: '10px',
  },
});

const availableButtonStyle = css({
  color: colors.darkmodeMediumWhite,
  backgroundColor: colors.coffeeBlue,
  cursor: 'pointer',
});

const unavailableButtonStyle = css({
  color: colors.darkmodeDisabledText,
  backgroundColor: colors.darkmodeDisabledBlack,
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

export default function SplashScreen({}) {
  const { currentUser, signInGuest, signUpGuest, signUpWithEmail, signIn } =
    useAuth();

  const [loading, setLoading] = useState(false);
  const [slide, setSlide] = useState('Init');
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
            maxWidth: '72%',
            marginInline: 'auto',
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  };

  const BackButton = () => {
    const handleBackButton = () => {
      slide !== 'Init' && setSlide('Init');
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
      opacity: slide === 'Init' ? 0.2 : 1,
    });

    return (
      <motion.div
        whileHover={{
          cursor: slide !== 'Init' && 'pointer',
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

      width: '100%',
    });

    const handleServiceButtonClick = (serviceSelection) => {
      setSlide(serviceSelection);
    };

    const slides = [
      { key: 0, title: 'Init' },
      { key: 1, title: 'Guest', available: true },
      { key: 2, title: 'Discord', available: false },
      { key: 3, title: 'Google', available: false },
      { key: 4, title: 'Facebook', available: false },
      { key: 5, title: 'Email' },
    ];

    const ServiceSelector = () => {
      return (
        <AnimationWrapper>
          <motion.div
            whileHover={{ color: colors.darkmodeHighWhite }}
            whileTap={{
              opacity: 0.4,
              transition: { duration: 0.1 },
            }}
            className={[buttonStyle(), availableButtonStyle()].join(' ')}
            style={{ backgroundColor: colors.coffeePink }}
            onClick={() => handleServiceButtonClick('Email')}
          >
            {'Sign up with Email'}
          </motion.div>
          {slides.map((service) => {
            if (
              service.title !== 'Init' &&
              service.title !== 'Email' &&
              service.title !== 'Guest'
            ) {
              return (
                <motion.div
                  key={service.key}
                  whileHover={
                    service.available && {
                      color: colors.darkmodeHighWhite,
                      transition: { duration: 0.1 },
                    }
                  }
                  whileTap={
                    service.available && {
                      opacity: 0.4,
                      transition: { duration: 0.1 },
                    }
                  }
                  className={[
                    buttonStyle(),
                    service.available
                      ? availableButtonStyle()
                      : unavailableButtonStyle(),
                  ].join(' ')}
                  style={{
                    backgroundColor:
                      service.title === 'Guest' && colors.coffeeBrown,
                  }}
                  onClick={() =>
                    service.available && handleServiceButtonClick(service.title)
                  }
                >
                  {service.title === 'Guest'
                    ? 'Continue as guest '
                    : 'Sign up with ' + service.title}
                </motion.div>
              );
            }
          })}
          <Separator>or</Separator>
          <motion.div
            whileHover={{
              color: colors.darkmodeHighWhite,
              transition: { duration: 0.1 },
            }}
            whileTap={{
              opacity: 0.4,
              transition: { duration: 0.1 },
            }}
            className={[buttonStyle(), availableButtonStyle()].join(' ')}
            style={{
              backgroundColor: colors.coffeeBrown,
            }}
            onClick={() => handleServiceButtonClick('Guest')}
          >
            {'Continue as guest '}
          </motion.div>
        </AnimationWrapper>
      );
    };

    return (
      <div className={container()}>
        {slide === 'Init' && <ServiceSelector />}
        {slide === 'Guest' && <GuestSlide />}
        {slide === 'Email' && <EmailSlide />}
        {slide === 'SignIn' && <SigninSlide />}
      </div>
    );
  };

  const GuestSlide = () => {
    const [name, setName] = useState('');
    const [nameFieldFocused, setNameFieldFocused] = useState(true);
    const [formFilled, setFormFilled] = useState('false');
    const [error, setError] = useState(null);

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
          signInGuest(_id);
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
            placeholder="Name"
            type="name"
            value={name}
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
              formFilled != 'loading' && {
                opacity: 0.4,
                transition: { duration: 0.1 },
              }
            }
            className={buttonStyle()}
            style={{ width: '20%', minWidth: '60px', opacity: 0 }}
            onClick={() =>
              formFilled != 'false' &&
              formFilled != 'loading' &&
              handleContinueButton()
            }
          >
            <LoadingAnimation formFilled={formFilled} buttonText={'continue'} />
          </motion.div>
        </div>
        {error}
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
        if (fieldName === 'Email') {
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

      // signUpWithEmail(name, email, password).then(({ success, error }) => {
      //   if (error) {
      //     setError(error);
      //     setFormFilled('true');
      //   }
      //   if (success) {
      //     setJustRegistered({ email, password });
      //     setError(null);
      //     setSlide('SignIn');
      //   }
      // });
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
            placeholder="Name"
            type="name"
            value={name}
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
            placeholder="Email adress"
            type="email"
            value={email}
            onChange={handleEmailInput}
            onKeyUp={(evt) => handleBackspaceAndEnter(evt, 'Email')}
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
            placeholder="Password"
            type="password"
            value={password}
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
              formFilled != 'loading' && {
                opacity: 0.4,
                transition: { duration: 0.1 },
              }
            }
            className={buttonStyle()}
            style={{ width: '20%', minWidth: '60px', opacity: 0 }}
            onClick={() =>
              formFilled != 'false' &&
              formFilled != 'loading' &&
              handleSignUpButton()
            }
          >
            <LoadingAnimation formFilled={formFilled} buttonText={'Sign up!'} />
          </motion.div>
        </div>
        {error}
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
      if (justRegistered) {
        setEmail(justRegistered.email);
        setPassword(justRegistered.password);
      }

      // Surely it's ok to just store the password client-side momentarily
      return () => setJustRegistered(null);
    }, []);

    useEffect(() => {
      emailInput?.current?.focus(); //this and autoFocus not working
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
        if (fieldName === 'Email') {
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
            placeholder="Email address"
            type="email"
            value={email}
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
            placeholder="Password"
            type="password"
            value={password}
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
            />
            <label htmlFor="keepMeSignedIn">&nbsp;Keep me signed in</label>
          </div>
          <motion.div
            animate={formFilled}
            variants={formFilledVariants}
            whileTap={
              formFilled != 'false' &&
              formFilled != 'loading' && {
                opacity: 0.4,
                transition: { duration: 0.1 },
              }
            }
            className={buttonStyle()}
            style={{
              width: '20%',
              minWidth: '60px',
              opacity: 0,
              opacity: formFilled === 'false' ? 0 : 1,
            }}
            // formFilled={formFilled}
            onClick={() =>
              formFilled != 'false' &&
              formFilled != 'loading' &&
              handleSignInButton()
            }
          >
            <LoadingAnimation formFilled={formFilled} buttonText={'Sign in'} />
          </motion.div>
        </div>
        {error}
        <Separator>or</Separator>
        {signInOptions.map((option) => {
          return (
            <motion.div
              key={option.key}
              whileHover={
                option.available && { color: colors.darkmodeHighWhite }
              }
              whileTap={
                option.available && {
                  opacity: 0.4,
                  transition: { duration: 0.1 },
                }
              }
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
              {'Sign in with ' + option.title}
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
          <h2>
            Welcome to <h1>Mingler!</h1>
          </h2>
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
      justifyContent: 'flex-start',
    });

    const handleAlreadyAMemberButton = () => {
      setSlide('SignIn');
    };

    const handleNotAMemberButton = () => {
      setSlide('Init');
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
        color: colors.coffeeBlue,
      });

      return (
        <motion.div
          className={footerLink()}
          whileHover={{
            textDecorationColor: colors.coffeeBlue,
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
          Already a member?&nbsp;
          <Prompt handleAlreadyAMemberButton={handleAlreadyAMemberButton}>
            Sign in
          </Prompt>
        </>
      );
    };

    const NotAMember = () => {
      return (
        <>
          Not a member yet?&nbsp;
          <Prompt handleNotAMemberButton={handleNotAMemberButton}>
            Sign up!
          </Prompt>
        </>
      );
    };

    return (
      <motion.div className={footer()}>
        {slide !== 'SignIn' && <AlreadyAMember />}
        {slide === 'SignIn' && <NotAMember />}
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div className={container()}>
        <MenuButton />
        <Header />

        <Slider />
        {/* <PostRegistrationScreen /> */}

        <Footer />
      </motion.div>
    </AnimatePresence>
  );
}
