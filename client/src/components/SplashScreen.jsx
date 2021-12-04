import React, { useEffect, useState, useRef } from 'react';
import { css, styled } from '@stitches/react';
import * as electron from 'electron';

import { useAuth } from '../contexts/AuthContext';
import colors from '../config/colors';
import { AnimatePresence, motion } from 'framer-motion';
import MenuButton from './MenuButton';
import { useLocalStorage } from '../helpers/localStorageManager';
import { LoadingAnimation } from './reusables/LoadingAnimation';

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
  textAlign: 'center',
  paddingInline: 20,
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
  paddingInline: '5%',
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

export default function SplashScreen({}) {
  const {
    currentUser,
    signInGuest,
    signUpGuest,
    signUpWithEmail,
    signIn,
    storeToken,
    deleteToken,
  } = useAuth();
  const [userName, setUserName] = useState(null);
  const [inputFocus, setInputFocus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slide, setSlide] = useState('Init');
  // const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [showWelcome, setShowWelcome] = useLocalStorage('showWelcome');
  const [justRegistered, setJustRegistered] = useLocalStorage('justRegistered');

  const inputRef = useRef();

  useEffect(() => {
    inputRef?.current?.focus();
  }, [inputRef?.current]);

  // Set new user status to false on unmount
  // so an experienced user is not met with
  // the same welcome screen
  useEffect(() => {
    return () => {
      localStorage.setItem('newUser', false);
    };
  }, []);

  const inputFocusToggle = (evt) => {
    setInputFocus(!inputFocus);
  };

  const handleNameChange = (evt) => {
    setUserName(evt.target.value);
  };

  const handleContinueClick = () => {
    setLoading(true);

    signUpGuest(userName).then(({ success, error }) => {
      success && signInGuest();
      console.log(error);
    });
  };

  const AnimationWrapper = ({ children }) => {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          style={{
            width: '40%',
            marginInline: 'auto',
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
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
      { title: 'Init' },
      { title: 'Guest', available: true },
      { title: 'Discord', available: false },
      { title: 'Google', available: false },
      { title: 'Facebook', available: false },
      { title: 'Email' },
    ];

    const BackButton = () => {
      const handleBackButton = () => {
        // const goBackToIndex =
        //   slides.findIndex((item) => item.title === slide) - 1;

        // if (goBackToIndex > -1) {
        //   setSlide(slides[goBackToIndex].title);
        // }
        setSlide('Init');
      };

      return (
        slide !== 'Init' &&
        slide !== 'SignIn' && (
          <div onClick={handleBackButton}>&#60; Go back</div>
        )
      );
    };

    const ServiceSelector = () => {
      return (
        <AnimationWrapper>
          {slides.map((service) => {
            if (service.title !== 'Init' && service.title !== 'Email') {
              return (
                <>
                  <motion.div
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
                    onClick={() =>
                      service.available &&
                      handleServiceButtonClick(service.title)
                    }
                  >
                    {service.title === 'Guest'
                      ? 'Continue as guest '
                      : 'Sign up with ' + service.title}
                  </motion.div>
                </>
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
            onClick={() => handleServiceButtonClick('Email')}
          >
            {'Sign up with Email'}
          </motion.div>
        </AnimationWrapper>
      );
    };

    return (
      <div className={container()}>
        <BackButton />
        {slide === 'Init' && <ServiceSelector />}
        {slide === 'Guest' && <GuestSlide />}
        {slide === 'Email' && <EmailSlide />}
        {slide === 'SignIn' && <LoginSlide />}
      </div>
    );
  };

  const GuestSlide = () => {
    const continueButtonStyle = css({
      width: '84%',
      textAlign: 'right',
      padding: 6,
      fontSize: '0.8em',
      fontWeight: 700,
    });

    return (
      <>
        <AnimationWrapper>
          <p>What do we call you?</p>

          <StyledInput
            onKeyUp={(event) => {
              if (event.key === 'Enter') {
                userName && handleContinueClick();
              }
            }}
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
        </AnimationWrapper>
      </>
    );
  };

  const EmailSlide = () => {
    const [name, setName] = useState(null);
    const [email, setEmail] = useState(null);
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
      return;
    };

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
        <motion.div
          animate={formFilled}
          variants={{
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
          }}
          whileTap={
            formFilled != 'false' &&
            formFilled != 'loading' && {
              opacity: 0.4,
              transition: { duration: 0.1 },
            }
          }
          className={buttonStyle()}
          // formFilled={formFilled}
          onClick={() =>
            formFilled != 'false' &&
            formFilled != 'loading' &&
            handleSignUpButton()
          }
        >
          Sign up!
          {formFilled === 'loading' && <LoadingAnimation />}
        </motion.div>
        {error}
      </AnimationWrapper>
    );
  };

  const LoginSlide = () => {
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [emailFieldFocused, setEmailFieldFocused] = useState();
    const [passwordFieldFocused, setPasswordFieldFocused] = useState();
    const [formFilled, setFormFilled] = useState('false');
    const [error, setError] = useState(null);
    const [keepMeSignedIn, setKeepMeSignedIn] = useState(true);

    useEffect(() => {
      if (justRegistered) {
        setEmail(justRegistered.email);
        setPassword(justRegistered.password);
      }
    }, []);

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
        if (formFilled === 'true') handleLoginButton();
      } else if (evt.key === 'Delete' || evt.key === 'Backspace') {
        if (fieldName === 'Email') {
          setEmail(evt.target.value);
        } else if (fieldName === 'password') {
          setPassword(evt.target.value);
        }
        validator();
      }
    };

    const handleLoginButton = () => {
      setFormFilled('loading');

      signIn(email, password).then(({ success, error }) => {
        if (error) {
          setError(error);
          setFormFilled('true');
        }
        if (success) {
          if (keepMeSignedIn) {
            storeToken(email);
          } else {
            deleteToken(email);
          }
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
      { title: 'Discord', available: false },
      { title: 'Google', available: false },
      { title: 'Facebook', available: false },
    ];

    const keepMeSignedInContainer = css({
      padding: 2,
      display: 'flex',
      justifyContent: 'flex-start',
    });

    return (
      <AnimationWrapper>
        <div
          style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
        >
          <input
            disabled={formFilled === 'loading' ? true : false}
            placeholder="Email adress"
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
        <div className={keepMeSignedInContainer()}>
          <input
            type="checkbox"
            name="keepMeSignedIn"
            checked={keepMeSignedIn}
            onClick={toggleKeepMeSignedIn}
          />
          <label for="keepMeSignedIn">&nbsp;Keep me signed in</label>
        </div>
        <motion.div
          animate={formFilled}
          variants={{
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
          }}
          whileTap={
            formFilled != 'false' &&
            formFilled != 'loading' && {
              opacity: 0.4,
              transition: { duration: 0.1 },
            }
          }
          className={buttonStyle()}
          // formFilled={formFilled}
          onClick={() =>
            formFilled != 'false' &&
            formFilled != 'loading' &&
            handleLoginButton()
          }
        >
          Sign in
          {formFilled === 'loading' && <LoadingAnimation />}
        </motion.div>
        {error}
        <Separator>or</Separator>
        {signInOptions.map((option) => {
          return (
            <>
              <motion.div
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
            </>
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
        {showWelcome ? (
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
