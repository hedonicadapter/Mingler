import React, { useEffect, useState, useRef } from 'react';
import { css, styled } from '@stitches/react';
import * as electron from 'electron';
import { IoIosArrowRoundBack } from 'react-icons/io';

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
  backgroundColor: colors.darkmodeBlack,
  height: window.innerHeight,

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
});
const header = css({
  fontSize: '1.4em',
  textAlign: 'center',
  paddingInline: 20,
  paddingBottom: 10,
});

const buttonStyle = css({
  margin: 4,
  padding: 8,
  textAlign: 'left',

  borderRadius: 3,
  border: '1px solid black',
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

const Separator = styled('h5', {
  display: 'flex',
  flexDirection: 'row',
  paddingInline: '10%',
  color: colors.darkmodeDisabledText,

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
  backgroundColor: colors.samBlue,
  cursor: 'pointer',
});

const unavailableButtonStyle = css({
  color: colors.darkmodeDisabledText,
  backgroundColor: colors.darkmodeDisabledBlack,
  cursor: 'auto',
});

const formFilledVariants = {
  true: {
    backgroundColor: colors.samBlue,
    color: colors.darkmodeHighWhite,
    cursor: 'pointer',
  },
  false: {
    backgroundColor: colors.darkmodeDisabledBlack,
    color: colors.darkmodeDisabledText,
    cursor: 'auto',
  },
  loading: {
    backgroundColor: colors.darkmodeDisabledBlack,
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
            maxWidth: '70%',
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
      setSlide('Init');
    };

    const backButton = css({
      marginTop: -20,
      display: 'flex',
      flexDirection: 'row',
      alignContent: 'center',
      alignItems: 'center',
      fontWeight: 'bold',
      fontSize: '0.6em',
    });

    return (
      slide !== 'Init' &&
      slide !== 'SignIn' && (
        <motion.div
          whileHover={{ cursor: 'pointer' }}
          className={backButton()}
          onClick={handleBackButton}
        >
          <IoIosArrowRoundBack size={20} /> <div>GO BACK</div>
        </motion.div>
      )
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
          {slides.map((service) => {
            if (service.title !== 'Init' && service.title !== 'Email') {
              return (
                <motion.div
                  key={service.key}
                  whileHover={
                    service.available && { color: colors.darkmodeHighWhite }
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
                      service.title === 'Guest' && colors.nudeBloo,
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
            whileHover={{ color: colors.darkmodeHighWhite }}
            whileTap={{
              opacity: 0.4,
              transition: { duration: 0.1 },
            }}
            className={[buttonStyle(), availableButtonStyle()].join(' ')}
            style={{ backgroundColor: colors.nudePink }}
            onClick={() => handleServiceButtonClick('Email')}
          >
            {'Sign up with Email'}
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
      justifyContent: 'space-between',
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
            onKeyUp={(evt) => handleBackspaceAndEnter(evt)}
            className={[inputStyle(), 'undraggable', 'clickable'].join(' ')}
            style={{
              color:
                nameFieldFocused && name
                  ? colors.darkmodeHighWhite
                  : colors.darkmodeMediumWhite,
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
          <BackButton />
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
            style={{ width: '20%', minWidth: '60px' }}
            onClick={() =>
              formFilled != 'false' &&
              formFilled != 'loading' &&
              handleContinueButton()
            }
          >
            {formFilled === 'loading' && <LoadingAnimation />}
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

      signUpWithEmail(name, email, password).then(({ success, error }) => {
        if (error) {
          setError(error);
          setFormFilled('true');
        }
        if (success) {
          setJustRegistered({ email, password });
          setError(null);
          setSlide('SignIn');
        }
      });
    };

    const buttonsContainer = css({
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
            disabled={formFilled === 'loading' ? true : false}
            placeholder="Name"
            type="name"
            value={name}
            onChange={handleNameInput}
            onKeyUp={(evt) => handleBackspaceAndEnter(evt, 'name')}
            className={[inputStyle(), 'undraggable', 'clickable'].join(' ')}
            style={{
              color:
                nameFieldFocused && name
                  ? colors.darkmodeHighWhite
                  : colors.darkmodeMediumWhite,
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
              color:
                emailFieldFocused && email
                  ? colors.darkmodeHighWhite
                  : colors.darkmodeMediumWhite,
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
        </div>
        <div className={buttonsContainer()}>
          <BackButton />
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
            style={{ width: '20%', minWidth: '60px' }}
            onClick={() =>
              formFilled != 'false' &&
              formFilled != 'loading' &&
              handleSignUpButton()
            }
          >
            Sign up!
            {formFilled === 'loading' && <LoadingAnimation />}
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
              color:
                emailFieldFocused && email
                  ? colors.darkmodeHighWhite
                  : colors.darkmodeMediumWhite,
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
            style={{ width: '20%', minWidth: '60px' }}
            // formFilled={formFilled}
            onClick={() =>
              formFilled != 'false' &&
              formFilled != 'loading' &&
              handleSignInButton()
            }
          >
            Sign in
            {formFilled === 'loading' && <LoadingAnimation />}
          </motion.div>
        </div>
        {error}
        <BackButton />
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
        {appSettings.showWelcome ? (
          <h2>
            Welcome to <h1>ShareHub!</h1>
          </h2>
        ) : (
          <h1>ShareHub</h1>
        )}
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
        color: colors.samBlue,
      });

      return (
        <motion.div
          className={footerLink()}
          whileHover={{
            textDecorationColor: colors.samBlue,
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
