import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize';
import { BsThreeDots, BsSpotify } from 'react-icons/bs';
import { IoLogoEdge, IoLogoChrome, IoCloseOutline } from 'react-icons/io5';
// import { IoCloseCircleSharp } from 'react-icons/io';
import ReactTooltip from 'react-tooltip';
import developermodeedge from '../../assets/developermodeedge.png';
import developermodechrome from '../../assets/developermodechrome.png';

import styles from './SettingsContent.module.css';
import { useLocalStorage } from '../helpers/localStorageManager';
import colors from '../config/colors';
import keys from '../config/keys';
import { useDispatch, useSelector } from 'react-redux';
import { FrameButtons, WindowFrame } from './reusables/WindowFrame';
import AccordionSetting from './AccordionSetting';
import Avatar from 'react-avatar';
import {
  getCurrentUser,
  getSettings,
  setProfilePictureMain,
  setUsernameMain,
  setEmailMain,
  setSettingsContentMain,
  setBrowserMain,
  setExtensionIDMain,
  setKeys,
} from '../mainState/features/settingsSlice';
import settingsDao from '../config/settingsDao';
import { useBrowserWindow } from '../contexts/BrowserWindowContext';
import { makeClickthrough } from '../config/clickthrough';
import animations from '../config/animations';
import path from 'path';
import { LoadingAnimation } from './reusables/LoadingAnimation';
import { compressFile, profilePictureToJSXImg } from '../helpers/fileManager';
import { useIsInViewport } from '../helpers/useIsInViewport';
import hotkeys from 'hotkeys-js';
import Keyboard from 'react-simple-keyboard';
// import layout from 'simple-keyboard-layouts/build/layouts/swedish';

const { remote, clipboard } = require('electron');
const BrowserWindow = remote.BrowserWindow;
const ipcRenderer = require('electron').ipcRenderer;

const defaultLayout = [
  '{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}',
  '1 2 3 4 5 6 7 8 9 0 + {backspace}',
  '{tab} q w e r t y u i o p \u00E5 ¨',
  "{capslock} a s d f g h j k l \u00F6 \u00E4 ' {enter}",
  '{shiftleft} z x c v b n m , . - {shiftright}',
  '{controlleft} {altleft} {space} {altright} {controlright}',
];

const shiftLayout = [
  '{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}',
  '! " # $ % & / ( ) = ? {backspace}',
  '{tab} Q W E R T Y U I O P \u00C5 ^',
  '{capslock} A S D F G H J K L \u00D6 \u00C4 * {enter}',
  '{shiftleft} Z X C V B N M ; : _ {shiftright}',
  '{controlleft} {altleft} {space} {altright} {controlright}',
];

const avatarLoadingContainer = {
  transition: 'opacity 0.15s ease',
  position: 'relative',
  height: 58,
  width: 58,
};
const avatarLoadingAnimationStyle = {
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%,-50%)',
  zIndex: 50,
  margin: 0,
};

const AnimationWrapper = ({ children, key }) => {
  return (
    <AnimatePresence exitBeforeEnter>
      {children && (
        <motion.div
          layout="position"
          key={key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const settings = [
  { title: 'Widget' },
  { title: 'Account' },
  { title: 'Set-up' },
];

const WidgetSettingsContent = ({ widgetSettingsContentInView, shortcut }) => {
  const [shortcutFormHovered, setShortcutFormHovered] = useState(false);
  const [shortcutError, setShortcutError] = useState(null);
  const [showShortcutError, setShowShortcutError] = useState(false);
  const [layoutName, setLayoutName] = useState('default');
  const dispatch = useDispatch();

  const keyboardRef = useRef(null);

  const captureAndSendShorcut = (event) => {
    // return dispatch(setKeys({ key: event.key, code: keys[0] }));
    let pressedKeyCodes = hotkeys.getPressedKeyCodes();
    let shortcuts = [];

    pressedKeyCodes.forEach((val) => {
      let key = keys[val];
      console.log('pressed key: ', key);

      shortcuts.push(key);
    });

    if (shortcuts.length === 1) return;

    ipcRenderer
      .invoke('changeshortcut:fromrenderer', shortcuts.join('+'))
      .then((res) => {
        if (!res) {
          setShortcutError('Something went wrong. Try again.');
        } else setShortcutError(null);
      });
  };

  const clearHighlights = () => {
    keyboardRef.current.recurseButtons((buttonElement) => {
      buttonElement.classList.remove('active');
    });
  };

  const highlightPersistedShortcut = () => {
    let split = shortcut.split('+');
    let keycode = [];

    clearHighlights();

    defaultLayout.forEach((row) => {
      split.forEach((key) => {
        if (key === 'CommandOrControl') key = 'controlleft';
        else if (key === 'Shift') key = 'shiftleft';

        if (key.length <= 1) {
          keycode = key;
        } else {
          keycode = row.match(
            // Match any part of the string and return the whole word with {} if any
            new RegExp(`({?\\b)(\\w*${key}\\w*)(\\b}?)`, 'ig')
          );
        }

        if (!keycode) return;

        keyboardRef.current
          .getButtonElement(keycode[0].toLowerCase())
          ?.classList.add('active');
        keyboardRef.current
          .getButtonElement(keycode[0].toUpperCase())
          ?.classList.add('active');
      });
    });
  };

  const handleShift = () => {
    const newLayoutName = layoutName === 'default' ? 'shift' : 'default';
    setLayoutName(newLayoutName);
  };

  const onKeyPress = (button) => {
    if (
      button === '{shiftleft}' ||
      button === '{shiftright}' ||
      button === '{capslock}'
    )
      handleShift();
  };

  useEffect(() => {
    console.log('widgetSettingsContentInView ', widgetSettingsContentInView);
    if (!widgetSettingsContentInView) return;

    hotkeys('*', function (event) {
      captureAndSendShorcut(event);
    });

    return () => hotkeys.unbind('*');
  }, [widgetSettingsContentInView]);

  useEffect(() => {
    if (!keyboardRef.current) return;

    highlightPersistedShortcut();
  }, [keyboardRef, layoutName, shortcut]);

  useEffect(() => {
    if (!shortcutError) return;
    const errorTimeout = setTimeout(() => {
      setShortcutError(null);
      setShowShortcutError(false);
    }, 3000);

    return () => clearTimeout(errorTimeout);
  }, [shortcutError]);

  return (
    <div
      className={styles.settingsContentContainer}
      style={{
        fontSize: '0.9em',
        color: colors.defaultPlaceholderTextColor,
      }}
      onMouseEnter={() => setShortcutFormHovered(true)}
      onMouseLeave={() => setShortcutFormHovered(false)}
    >
      <div className={styles.keyboardSettingsForm}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingBottom: 14,
          }}
        >
          <header>Toggle shortcut</header>
          <div
            style={{
              width: 55,
              border: '4px solid ' + colors.offWhitePressed2,
              borderRadius: 2,
            }}
          >
            <div
              style={{
                borderBottom: '2px solid ' + colors.defaultPlaceholderTextColor,
                float: 'right',
                width: '100%',
              }}
            >
              <motion.div
                initial={'hide'}
                animate={'show'}
                exit={'hide'}
                transition={{
                  duration: 0.15,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  repeatDelay: 1.8,
                }}
                variants={{
                  show: {
                    transform: 'translateX(0%)',
                    opacity: 1,
                  },
                  hide: {
                    transform: 'translateX(100%)',
                    opacity: 0,
                  },
                }}
                style={{
                  float: 'right',
                  backgroundColor: colors.offWhite,
                  height: 25,
                  width: 12,
                }}
                className={styles.miniWidget}
              />
            </div>
          </div>
        </div>
        <div className={styles.keyboardContainer}>
          <Keyboard
            onKeyPress={onKeyPress}
            keyboardRef={(r) => (keyboardRef.current = r)}
            physicalKeyboardHighlightBgColor={colors.coffeeOrange}
            layoutName={layoutName}
            layout={{
              default: defaultLayout,
              shift: shiftLayout,
            }}
            display={{
              '{controlleft}': 'Ctrl',
              '{altleft}': 'Alt',
              '{altright}': 'AltGr',
              '{controlright}': 'Ctrl',
              '{enter}': '↩',
              '{backspace}': '⌫',
              '{escape}': 'esc',
              '{f1}': 'F1',
              '{f2}': 'F2',
              '{f3}': 'F3',
              '{f4}': 'F4',
              '{f5}': 'F5',
              '{f6}': 'F6',
              '{f7}': 'F7',
              '{f8}': 'F8',
              '{f9}': 'F9',
              '{f10}': 'F10',
              '{f11}': 'F11',
              '{f12}': 'F12',
              '{tab}': '↹',
              '{capslock}': 'caps',
              '{shiftleft}': '⇧',
              '{shiftright}': '⇧',
              '{space}': ' ',
            }}
            physicalKeyboardHighlight={true}
            physicalKeyboardHighlightPress={true}
          />
        </div>

        <motion.div
          initial={'hide'}
          animate={showShortcutError || shortcutFormHovered ? 'show' : 'hide'}
          variants={{
            show: { height: 'auto', y: 0, opacity: 1 },
            hide: { height: 0, y: -40, opacity: 0 },
          }}
          transition={{ duration: 0.15 }}
        >
          <footer>
            <AnimatePresence>
              {!shortcutError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <p>
                    Press two or more keys on your keyboard to set a new
                    <br />
                    shortcut.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {shortcutError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className={styles.shortcutError}
                  onAnimationComplete={() =>
                    !showShortcutError && setShowShortcutError(true)
                  }
                >
                  <p>{shortcutError}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </footer>
        </motion.div>
      </div>
    </div>
  );
};

const AccountSettingsContent = ({
  username,
  email,
  handleProfilePictureChange,
  formFilled,
  handleNameChange,
  handleEmailChange,
  dispatch,
  settingsState,
  fileInputRef,
  profilePictureError,
  usernameError,
  emailError,
  spotifyError,
}) => {
  const [connectedToSpotify, setConnectedToSpotify] = useState();
  const [spotifyHovered, setSpotifyHovered] = useState(false);
  const [disconnectSpotifyHovered, setDisconnectSpotifyHovered] =
    useState(false);

  useEffect(() => {
    console.log({
      connectedToSpotify,
      accesstoken: settingsState.currentUser?.spotifyAccessToken,
      expired:
        new Date() < new Date(settingsState.currentUser?.spotifyExpiryDate),
    });
  }, [connectedToSpotify]);

  useEffect(() => {
    settingsState.currentUser?.spotifyConnected
      ? setConnectedToSpotify(true)
      : setConnectedToSpotify(false);
  }, [settingsState.currentUser?.spotifyConnected]);

  const SpotifyTextAnimationWrapper = ({ index, children }) => (
    <motion.div
      key={index}
      initial={
        !connectedToSpotify && !spotifyError ? { opacity: 1 } : { opacity: 0 }
      }
      animate={{ opacity: 1 }}
      exit={
        !connectedToSpotify && !spotifyError && !spotifyHovered
          ? { opacity: 1 }
          : { opacity: 0 }
      }
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.div>
  );

  const SpotifyText = () => {
    return (
      <AnimatePresence exitBeforeEnter>
        {connectedToSpotify && disconnectSpotifyHovered && (
          <SpotifyTextAnimationWrapper index={0}>
            <div>disconnect</div>
          </SpotifyTextAnimationWrapper>
        )}

        {!disconnectSpotifyHovered &&
          (spotifyError || connectedToSpotify) &&
          spotifyHovered && (
            <SpotifyTextAnimationWrapper index={1}>
              <div>reconnect</div>
            </SpotifyTextAnimationWrapper>
          )}

        {!disconnectSpotifyHovered && spotifyError && !spotifyHovered && (
          <SpotifyTextAnimationWrapper index={2}>
            <div>{spotifyError}</div>
          </SpotifyTextAnimationWrapper>
        )}

        {!disconnectSpotifyHovered && connectedToSpotify && !spotifyHovered && (
          <SpotifyTextAnimationWrapper index={3}>
            <div>connected</div>
          </SpotifyTextAnimationWrapper>
        )}

        {!connectedToSpotify && !spotifyError && (
          <SpotifyTextAnimationWrapper index={4}>
            <div>connect</div>
          </SpotifyTextAnimationWrapper>
        )}
      </AnimatePresence>
    );
  };

  return (
    <motion.div className={styles.settingsContentContainer}>
      <div className={styles.profilePictureFormContainer}>
        <motion.div
          className={styles.avatarContainer}
          whileHover={
            formFilled !== 'loading' && {
              cursor: 'pointer',
              backgroundColor: colors.offWhitePressed2,
              borderRadius: '50%',
            }
          }
          transition={{ duration: 0.1 }}
        >
          <motion.label
            whileHover={{
              cursor: formFilled === 'loading' ? 'default' : 'pointer',
            }}
            htmlFor="file-upload"
            className="custom-file-upload"
            onClick={(evt) => {
              evt.target.value = ''; // So you can pick the same file twice
            }}
            ref={fileInputRef}
            style={{
              opacity: formFilled === 'loading' ? 0.8 : 1,
              ...avatarLoadingContainer,
            }}
          >
            <LoadingAnimation
              style={avatarLoadingAnimationStyle}
              formFilled={formFilled}
            />

            <Avatar
              className="avatar"
              round
              name={username}
              size="58"
              src={profilePictureToJSXImg(
                settingsState.currentUser.profilePicture,
                settingsState.currentUser.demoUser
              )}
            />
          </motion.label>
          <input
            onClick={(evt) => {
              evt.target.value = ''; // So you can pick the same file twice
            }}
            onChange={handleProfilePictureChange}
            onFocus={(evt) => evt.preventDefault()}
            disabled={formFilled === 'loading' ? true : false}
            accept="image/*"
            id="file-upload"
            type="file"
            style={{
              opacity: 0,
              position: 'absolute',
              zIndex: -1,
              display: 'none',
            }}
          />
        </motion.div>

        {profilePictureError ? (
          <div className={styles.profilePictureErrorContainer}>
            {profilePictureError}
          </div>
        ) : (
          <div className={styles.inputsContainer}>
            <TextareaAutosize
              spellCheck="false"
              placeholder="Username"
              maxLength={25}
              maxRows={1}
              className={styles.genericInput}
              readOnly={usernameError ? true : false}
              value={usernameError ? usernameError : username || ''}
              style={{
                color: usernameError
                  ? colors.coffeeRed
                  : colors.darkmodeLightBlack,
                cursor: usernameError ? 'default' : 'auto',
              }}
              onChange={handleNameChange}
            />
            <TextareaAutosize
              spellCheck="false"
              placeholder="Email"
              maxLength={25}
              maxRows={1}
              title={
                settingsState?.currentUser?.guest
                  ? 'Not currently available for guest users. '
                  : null
              }
              disabled={
                settingsState?.currentUser?.guest ||
                settingsState?.currentUser?.demoUser
                  ? true
                  : false
              }
              className={styles.genericInput}
              readOnly={emailError ? true : false}
              value={emailError ? emailError : email || ''}
              style={{
                opacity:
                  settingsState?.currentUser?.guest ||
                  settingsState?.currentUser?.demoUser
                    ? 0.4
                    : 1,
                color: emailError
                  ? colors.coffeeRed
                  : colors.darkmodeLightBlack,
                cursor:
                  settingsState?.currentUser?.guest ||
                  settingsState?.currentUser?.demoUser ||
                  emailError
                    ? 'default'
                    : 'auto',
                '&:hover, &:focus': {
                  color: usernameError
                    ? colors.coffeeRed
                    : colors.darkmodeBlack,
                },
              }}
              onChange={handleEmailChange}
            />
          </div>
        )}
      </div>
      <div className={styles.connectAndDisconnectSpotifyContainer}>
        <motion.div
          className={styles.connectSpotifyContainer}
          style={{
            transition: 'color 0.15s linear',
            color:
              spotifyError || disconnectSpotifyHovered
                ? colors.coffeeRed
                : connectedToSpotify
                ? spotifyHovered
                  ? colors.darkmodeLighterBlack
                  : colors.coffeeGreen
                : spotifyHovered
                ? colors.darkmodeLighterBlack
                : colors.defaultPlaceholderTextColor,
          }}
          whileHover={
            spotifyError
              ? {
                  cursor: 'default',
                }
              : {
                  cursor: 'pointer',
                }
          }
          whileTap={animations.whileTap}
          onClick={() => {
            ipcRenderer.send('toggleconnectspotify:fromrenderer');
            setSpotifyHovered(false);
          }}
          onMouseEnter={() => setSpotifyHovered(true)}
          onMouseLeave={() => setSpotifyHovered(false)}
        >
          <BsSpotify size={'18px'} style={{ paddingRight: 6 }} />
          <SpotifyText />
        </motion.div>
        <motion.div
          whileTap={animations.whileTap}
          transition={{ duration: 0.15 }}
          className={styles.disconnectSpotifyButtonContainer}
          onClick={() => ipcRenderer.send('disconnectspotify:fromrenderer')}
          style={{
            transition: 'color 0.15s linear',
            color: spotifyError
              ? colors.coffeeRed
              : connectedToSpotify
              ? spotifyHovered
                ? colors.darkmodeLighterBlack
                : colors.coffeeGreen
              : spotifyHovered
              ? colors.darkmodeLighterBlack
              : colors.defaultPlaceholderTextColor,
          }}
        >
          <AnimatePresence>
            {settingsState.currentUser?.spotifyConnected && !spotifyError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                whileHover={{ color: colors.coffeeRed }}
                onMouseEnter={() => setDisconnectSpotifyHovered(true)}
                onMouseLeave={() => setDisconnectSpotifyHovered(false)}
              >
                <IoCloseOutline
                  size={22}
                  className={styles.disconnectSpotifyButton}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

const SetupSettingsHeader = ({ browser, browserIconOnClickHandler }) => {
  return (
    <motion.div className={styles.setupSettingsHeaderBrowserPicker}>
      <div className={styles.setupSettingsHeaderBrowserName}>{browser}</div>
      <motion.div
        className={styles.browserIcons}
        whileHover={animations.whileHover}
        whileTap={animations.whileTap}
        onClick={() => browserIconOnClickHandler('Chrome')}
        style={{
          color:
            browser === 'Chrome'
              ? colors.darkmodeLightBlack
              : colors.defaultPlaceholderTextColor,
        }}
      >
        <IoLogoChrome size={25} />
      </motion.div>
      <motion.div
        className={styles.browserIcons}
        whileHover={animations.whileHover}
        whileTap={animations.whileTap}
        onClick={() => browserIconOnClickHandler('Edge')}
        style={{
          color:
            browser === 'Edge'
              ? colors.darkmodeLightBlack
              : colors.defaultPlaceholderTextColor,
        }}
      >
        <IoLogoEdge size={25} />
      </motion.div>
    </motion.div>
  );
};

const MockBrowserWindow = ({ browser }) => {
  const chrome = browser === 'Chrome';

  return (
    <div className={styles.mockBrowserContainer}>
      <div className={styles.mockBrowserHeader}>
        <div className={styles.mockBrowserTrafficLights}>
          <FrameButtons />
        </div>
        <div className={styles.mockBrowserAddressBar}>
          &nbsp; &nbsp;
          {chrome ? 'chrome://extensions' : 'edge://extensions'}
        </div>
        <div className={styles.mockBrowserMenu}>
          <BsThreeDots size={18} />
        </div>
      </div>
      <img
        className={styles.mockBrowserWebcontents}
        src={chrome ? developermodechrome : developermodeedge}
      />
    </div>
  );
};

const SetupSettingsContent = ({ browser, storedID }) => {
  window.onbeforeunload = (e) => {
    e.returnValue = false; // Cancels close, true unclosable
  };

  useEffect(() => {
    ipcRenderer.once('exit:frommain', () => {
      window.onbeforeunload = (e) => {
        e.returnValue = undefined;
      };
    });
  }, []);

  const [extensionID, setExtensionID] = useState(storedID); // TODO: get from redux
  const [extensionIDSaved, setExtensionIDSaved] = useState(false);
  const [extensionIDError, setExtensionIDError] = useState(false);

  const dispatch = useDispatch();

  const installationPath = path.resolve(
    remote.app.getAppPath(),
    '..',
    'extension'
  );

  const handleToolTipAfterShow = () => {
    // if (browser === 'Chrome') {
    //
    // } else if (browser === 'Edge') {
    //
    // }

    setTimeout(() => ReactTooltip.hide(), 1500);
  };

  const handleDetectedTextClick = () => {
    navigator.clipboard.writeText(installationPath);
  };

  const handleExtensionIDInput = (evt) => {
    setExtensionIDError(false);
    setExtensionIDSaved(false);
    setExtensionID(evt.target.value);
  };

  const handleSaveExtensionIDKeyUp = (evt) => {
    if (evt.key === 'Enter') handleSaveExtensionIDInput();
  };

  const handleSaveExtensionIDInput = () => {
    if (
      !extensionID ||
      extensionIDSaved ||
      extensionIDError ||
      extensionID === storedID
    )
      return;

    ipcRenderer
      .invoke('setextensionid:fromrenderer', validateExtensionID())
      .then((res) => {
        if (res) {
          return setExtensionIDSaved(true);
        }
        setExtensionIDError(true);
        console.error(res);
      });
  };

  const validateExtensionID = () => {
    let extensionIDCleaned = extensionID.replace(/ /g, '');

    if (extensionIDCleaned.startsWith('ID:')) {
      extensionIDCleaned = extensionIDCleaned.substring(3);
    } else if (extensionIDCleaned.startsWith('ID')) {
      extensionIDCleaned = extensionIDCleaned.substring(2);
    }

    return extensionIDCleaned.toLowerCase();
  };

  return (
    <div
      className={[
        styles.setupSettingsContainer,
        styles.settingsContentContainer,
      ].join(' ')}
    >
      <ol className={styles.setupInstructionsText}>
        <li>1. Open the extensions settings in {browser}</li>
        <ul>
          <li>
            {browser === 'Chrome' ? (
              <a
                className={styles.detectedTextContainer}
                data-tip="copied."
                data-event="click focus"
                onClick={() =>
                  navigator.clipboard.writeText('chrome://extensions')
                }
              >
                <IoLogoChrome className={styles.detectedIcon} size={16} />
                <mark className={styles.detectedText}>chrome://extensions</mark>
              </a>
            ) : (
              <a
                className={styles.detectedTextContainer}
                data-tip="copied."
                data-event="click focus"
                onClick={() =>
                  navigator.clipboard.writeText('edge://extensions')
                }
              >
                <IoLogoEdge className={styles.detectedIcon} size={16} />
                <mark className={styles.detectedText}>edge://extensions</mark>
              </a>
            )}
          </li>
        </ul>
        <ReactTooltip
          globalEventOff="click"
          place="top"
          type="dark"
          effect="solid"
          afterShow={handleToolTipAfterShow}
          isCapture={true}
          className={styles.toolTip}
        />

        <li>2. Enable developer mode</li>
        <ul>
          <li>
            <MockBrowserWindow browser={browser} />
          </li>
        </ul>
        <li>
          3. Click 'load unpacked' and select the mingler extension folder
          {/* it is what it is */}
        </li>
        <ul>
          <li>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <div style={{ paddingRight: 4 }}>detected: </div>
              <a className={styles.detectedTextContainer}>
                <mark
                  className={styles.detectedText}
                  onClick={handleDetectedTextClick}
                  data-tip="copied."
                  data-event="click focus"
                >
                  {installationPath}
                </mark>
              </a>
            </div>
          </li>
        </ul>
        <li>
          4. In the {browser} extensions list, find the mingler extension and
          <div>&nbsp;&nbsp;&nbsp;&nbsp;its ID...</div>
        </li>
        <li>5. ...and save it here:</li>
        <ul>
          <div className={styles.extensionIDInputContainer}>
            <input
              type="text"
              className={styles.genericInput}
              placeholder="e.g. aemjofpcokklmfkjgkljmoojdldgichj"
              value={extensionID}
              onChange={handleExtensionIDInput}
              style={{ paddingLeft: 10 }}
            />
            <motion.div
              className={styles.extensionIDSaveButton}
              onClick={handleSaveExtensionIDInput}
              onKeyUp={handleSaveExtensionIDKeyUp}
              whileHover={{
                ...animations.whileHover,
                cursor:
                  extensionIDSaved || extensionIDError
                    ? 'default'
                    : extensionID && extensionID != storedID
                    ? 'pointer'
                    : 'default',
              }}
              whileTap={
                !extensionIDSaved &&
                !extensionIDError &&
                extensionID &&
                extensionID != storedID &&
                animations.whileTap
              }
              style={{
                color: extensionIDError
                  ? colors.coffeeRed
                  : extensionIDSaved
                  ? colors.coffeeGreen
                  : extensionID && extensionID != storedID
                  ? colors.darkmodeLightBlack
                  : colors.darkmodeDisabledText,
              }}
            >
              {extensionIDError ? 'error' : extensionIDSaved ? 'saved' : 'save'}
            </motion.div>
          </div>
        </ul>
        <br />
        <li>and hopefully that works.</li>
      </ol>
    </div>
  );
};

const SettingsContentHeader = ({
  title,
  browser,
  browserIconOnClickHandler,
}) => {
  return (
    <div className={styles.contentHeader}>
      {title}
      {title === 'Set-up' && (
        <SetupSettingsHeader
          browser={browser}
          browserIconOnClickHandler={browserIconOnClickHandler}
        />
      )}
      {/* {title === 'Widget' && (
        
      )} */}
    </div>
  );
};

export default function SettingsContent() {
  makeClickthrough();

  const settingsState = useSelector(getSettings);
  const dispatch = useDispatch();

  const widgetSettingsContentRef = useRef(null);
  const accountSettingsContentRef = useRef(null);
  const setupSettingsContentRef = useRef(null);

  const widgetSettingsContentInView = useIsInViewport(widgetSettingsContentRef);
  const accountSettingsContentInView = useIsInViewport(
    accountSettingsContentRef
  );
  const setupSettingsContentInView = useIsInViewport(setupSettingsContentRef);

  const [expanded, setExpanded] = useState(0);

  const [formFilled, setFormFilled] = useState(false);
  const [username, setUsername] = useState(
    settingsState?.currentUser?.username
  );
  const [email, setEmail] = useState(settingsState?.currentUser?.email);

  const [profilePictureError, setProfilePictureError] = useState(null);
  const [usernameError, setUsernameError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [spotifyError, setSpotifyError] = useState(null);

  useEffect(() => {
    if (widgetSettingsContentInView) setExpanded(0);
    if (accountSettingsContentInView) setExpanded(1);
    if (setupSettingsContentInView) setExpanded(2);
  }, [
    widgetSettingsContentInView,
    accountSettingsContentInView,
    setupSettingsContentInView,
  ]);

  useEffect(() => {
    dispatch(setSettingsContentMain(settings[expanded]?.title) || 'Widget');
  }, [expanded]);

  useEffect(() => {
    const errorTimeout = setTimeout(() => setProfilePictureError(null), 3000);

    return () => clearTimeout(errorTimeout);
  }, [profilePictureError]);

  useEffect(() => {
    const errorTimeout = setTimeout(() => setEmailError(null), 3000);

    return () => clearTimeout(errorTimeout);
  }, [emailError]);

  useEffect(() => {
    const errorTimeout = setTimeout(() => setUsernameError(null), 3000);

    return () => clearTimeout(errorTimeout);
  }, [usernameError]);

  useEffect(() => {
    console.log('useEffect ', spotifyError);
    const errorTimeout = setTimeout(() => setSpotifyError(null), 3000);

    return () => clearTimeout(errorTimeout);
  }, [spotifyError]);

  const fileInputRef = useRef(null);

  const handleEscapeKey = (evt) => {
    if (evt.keyCode === 27) {
      BrowserWindow.getFocusedWindow().close();
    }
  };

  const uploadFile = (file) => {
    let formData = new FormData();
    formData.append('userID', settingsState.currentUser._id);
    formData.append('profilePicture', file, file.name);

    settingsDao
      .setProfilePicture(formData, settingsState.currentUser.accessToken)
      .then((res) => {
        if (res?.data?.success) {
          dispatch(setProfilePictureMain(res.data));
          setProfilePictureError(null);
        }
      })
      .catch((e) => {
        setProfilePictureError(e?.response?.data?.error);
      })
      .finally(() => {
        setFormFilled(false);
        formData = null;
      });
  };

  const handleProfilePictureChange = async (evt) => {
    const file = Array.from(evt.target.files)[0];
    if (!file) return;

    setFormFilled('loading');

    if (file.type === 'image/gif') {
      uploadFile(file); // couldn't figure out how to compress gifs, compressFile() removes animation
    } else {
      compressFile(file, (result) => {
        uploadFile(result);
      });
    }
  };

  const handleNameChange = (evt) => {
    let newUsername = evt.target.value;
    setUsername(evt.target.value);

    settingsDao
      .setUsername(
        settingsState.currentUser._id,
        newUsername,
        settingsState.currentUser.accessToken
      )
      .then((res) => {
        if (res?.data?.success) {
          dispatch(setUsernameMain(res.data.username));
          setUsernameError(null);
        }
      })
      .catch((e) => setUsernameError(e?.response?.data?.error));
  };

  const handleEmailChange = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    let newEmail = evt.target.value;

    setEmail(evt.target.value);

    settingsDao
      .setEmail(
        settingsState.currentUser._id,
        newEmail,
        settingsState.currentUser.accessToken
      )
      .then((res) => {
        if (res?.data?.success) {
          dispatch(setEmailMain(res.data.email));
          setEmailError(null);
        }
      })
      .catch((e) => setEmailError(e?.response?.data?.error));
  };

  const quickSettingHandler = (e, quickSetting) => {
    if (quickSetting === 'profilePictureClicked') {
      fileInputRef?.current.click();

      setExpanded(1);
    }
  };

  const preventSpacebarScroll = (e) => {
    if (e.keyCode === 32 && e.target === document.body) {
      e.preventDefault();
    }
  };

  const preventTabNavigation = (e) => {
    if (e.keyCode === 9 && e.target === document.body) {
      e.preventDefault();
    }
  };

  const toggleConnectSpotifyErrorHandler = (e, error) => {
    setSpotifyError(error);
  };

  const browserIconOnClickHandler = (browser = 'Chrome') => {
    dispatch(setBrowserMain(browser));
  };

  useEffect(() => {
    window.addEventListener('keydown', preventSpacebarScroll);
    window.addEventListener('keydown', preventTabNavigation);
    ipcRenderer.on('quickSetting', quickSettingHandler);
    ipcRenderer.on(
      'toggleconnectspotifyerror:fromrenderer',
      toggleConnectSpotifyErrorHandler
    );

    return () => {
      window.removeEventListener('keydown', preventSpacebarScroll);
      window.removeEventListener('keydown', preventTabNavigation);
      ipcRenderer.removeAllListeners('quickSetting', quickSettingHandler);
      ipcRenderer.removeAllListeners(
        'toggleconnectspotifyerror:fromrenderer',
        toggleConnectSpotifyErrorHandler
      );
    };
  }, []);

  return (
    <div className={styles.container} onKeyDown={handleEscapeKey}>
      <WindowFrame title={'Settings'}>
        <div className={styles.menuAndContentContainer}>
          <div className={styles.menu}>
            {settings.map((setting, index) => {
              return (
                <div
                  onClick={() => {
                    setExpanded(index);
                    if (index === 0)
                      widgetSettingsContentRef.current.parentNode.scrollTop =
                        widgetSettingsContentRef.current?.offsetTop - 80;
                    if (index === 1)
                      accountSettingsContentRef.current.parentNode.scrollTop =
                        accountSettingsContentRef.current?.offsetTop - 80;
                    if (index === 2)
                      setupSettingsContentRef.current.parentNode.scrollTop =
                        setupSettingsContentRef.current?.offsetTop - 80;
                  }}
                >
                  <AccordionSetting
                    setting={setting}
                    key={index}
                    index={index}
                    expanded={expanded}
                    setExpanded={setExpanded}
                  />
                </div>
              );
            })}
          </div>
          <div className={styles.contentContainer}>
            <div
              className={styles.contentWrapper}
              ref={widgetSettingsContentRef}
            >
              <SettingsContentHeader
                title={'Widget'}
                browser={settingsState.browser}
                browserIconOnClickHandler={browserIconOnClickHandler}
              />
              <WidgetSettingsContent
                shortcut={settingsState?.globalShortcut}
                widgetSettingsContentInView={widgetSettingsContentInView}
              />
            </div>
            <div
              className={styles.contentWrapper}
              ref={accountSettingsContentRef}
            >
              <SettingsContentHeader
                title={'Account'}
                browser={settingsState.browser}
                browserIconOnClickHandler={browserIconOnClickHandler}
              />
              <AccountSettingsContent
                fileInputRef={fileInputRef}
                handleProfilePictureChange={handleProfilePictureChange}
                formFilled={formFilled}
                handleNameChange={handleNameChange}
                handleEmailChange={handleEmailChange}
                username={username}
                email={email}
                dispatch={dispatch}
                settingsState={settingsState}
                profilePictureError={profilePictureError}
                usernameError={usernameError}
                emailError={emailError}
                spotifyError={spotifyError}
              />
            </div>
            <div
              className={styles.contentWrapper}
              ref={setupSettingsContentRef}
            >
              <SettingsContentHeader
                title={'Set-up'}
                browser={settingsState.browser}
                browserIconOnClickHandler={browserIconOnClickHandler}
              />
              <SetupSettingsContent
                browser={settingsState.browser}
                storedID={settingsState.extensionID}
              />
            </div>
            {/* <AnimationWrapper key={0}>
            {settingsState.settingsContent === 'Widget' && (
              <WidgetSettingsContent />
              )}
              </AnimationWrapper>

            <AnimationWrapper key={1}>
              {settingsState.settingsContent === 'Account' && (
                <AccountSettingsContent
                  fileInputRef={fileInputRef}
                  handleProfilePictureChange={handleProfilePictureChange}
                  handleNameChange={handleNameChange}
                  handleEmailChange={handleEmailChange}
                  username={username}
                  email={email}
                  dispatch={dispatch}
                  settingsState={settingsState}
                  profilePictureError={profilePictureError}
                  usernameError={usernameError}
                  emailError={emailError}
                  spotifyError={spotifyError}
                />
              )}
            </AnimationWrapper>

            <AnimationWrapper key={2}>
              {settingsState.settingsContent === 'Set-up' && (
                <SetupSettingsContent />
              )}
            </AnimationWrapper> */}
          </div>
        </div>
      </WindowFrame>
    </div>
  );
}
