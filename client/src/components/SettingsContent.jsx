import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize';
import { BsThreeDots, BsSpotify } from 'react-icons/bs';
import { IoLogoEdge, IoLogoChrome } from 'react-icons/io5';
import ReactTooltip from 'react-tooltip';
import developermodeedge from '../../assets/developermodeedge.png';
import developermodechrome from '../../assets/developermodechrome.png';
import Uploady from '@rpldy/uploady';
import UploadButton from '@rpldy/upload-button';

import styles from './SettingsContent.module.css';
import { useLocalStorage } from '../helpers/localStorageManager';
import colors from '../config/colors';
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
} from '../mainState/features/settingsSlice';
import settingsDao from '../config/settingsDao';
import { useBrowserWindow } from '../contexts/BrowserWindowContext';
import { makeClickthrough } from '../config/clickthrough';
import animations from '../config/animations';
import path from 'path';
import { LoadingAnimation } from './reusables/LoadingAnimation';
import { compressFile, profilePictureToJSXImg } from '../helpers/fileManager';

const { remote, clipboard } = require('electron');
const BrowserWindow = remote.BrowserWindow;
const ipcRenderer = require('electron').ipcRenderer;

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
          layout
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
  { title: 'General' },
  { title: 'Account' },
  { title: 'Set-up' },
];

const GeneralSettingsContent = () => {
  return (
    <div
      className={styles.settingsContentContainer}
      style={{
        fontSize: '0.9em',
        color: colors.defaultPlaceholderTextColor,
      }}
    >
      Nothing to see here yet.
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

  const spotifyTextAnimationControls = useAnimation();

  useEffect(() => {
    let now = new Date();
    let spotifyExpiryDate = new Date(
      settingsState.currentUser?.spotifyExpiryDate
    );

    if (
      // If access token exists and hasnt expired
      settingsState.currentUser?.spotifyAccessToken &&
      now < spotifyExpiryDate
    ) {
      setConnectedToSpotify(true);
    } else setConnectedToSpotify(false);
  }, [
    settingsState.currentUser?.spotifyAccessToken,
    settingsState.currentUser?.spotifyExpiryDate,
  ]);

  const animationSequence = async () => {
    await spotifyTextAnimationControls.start({
      opacity: 0,
      transition: { duration: 0 },
    });
    return await spotifyTextAnimationControls.start({
      opacity: 1,
      transition: { duration: 0.3, color: colors.defaultPlaceholderTextColor },
    });
  };

  useEffect(() => {
    animationSequence();
  }, [spotifyError, connectedToSpotify, spotifyHovered]);

  const SpotifyText = () => {
    if (spotifyError) {
      if (spotifyHovered) return 'reconnect';
      return spotifyError;
    } else if (connectedToSpotify) {
      if (spotifyHovered) return 'reconnect';
      return 'connected';
    } else return 'connect';
  };

  return (
    <div className={styles.settingsContentContainer}>
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
          {/* <Uploady
            destination={{
              url: 'https://menglir.herokuapp.com/api/private/setProfilePicture',
              headers: {
                Authorization: `Bearer ${settingsState?.currentUser?.accessToken}`,
              },
            }}
          >
            <UploadButton />
          </Uploady> */}
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
      <motion.div
        className={styles.connectSpotifyContainer}
        style={{
          color: spotifyError
            ? colors.coffeeRed
            : connectedToSpotify
            ? colors.pastelGreen
            : colors.offWhitePressed2,
        }}
        whileHover={
          spotifyError
            ? {
                color: colors.coffeeRed,
                cursor: 'default',
              }
            : {
                color: colors.pastelGreen,
                cursor: 'pointer',
              }
        }
        whileTap={animations.whileTap}
        transition={{ duration: 0.15 }}
        onClick={() => ipcRenderer.send('toggleconnectspotify:fromrenderer')}
        onMouseEnter={() => setSpotifyHovered(true)}
        onMouseLeave={() => setSpotifyHovered(false)}
      >
        <BsSpotify size={'18px'} style={{ paddingRight: 6 }} />
        <motion.div animate={spotifyTextAnimationControls}>
          <SpotifyText />
        </motion.div>
      </motion.div>
    </div>
  );
};

const SetupSettingsHeader = ({ browser, browserIconOnClickHandler }) => {
  return (
    <div className={styles.setupSettingsHeaderBrowserPicker}>
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
    </div>
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
  const [extensionID, setExtensionID] = useState(storedID); // TODO: get from redux
  const [extensionIDSaved, setExtensionIDSaved] = useState(false);
  const [extensionIDError, setExtensionIDError] = useState(false);

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
        if (res) return setExtensionIDSaved(true);
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
          3. Click 'load unpacked' and select the mingler
          <div>&nbsp;&nbsp;&nbsp;&nbsp;extension folder</div>
          {/* it is what it is */}
        </li>
        <ul>
          <li>
            detected:{' '}
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
          </li>
        </ul>
        <li>
          3. In the {browser} extensions list, find the mingler extension{' '}
          <div>&nbsp;&nbsp;&nbsp;&nbsp;and its ID...</div>
        </li>
        <li>4. ...and save it here:</li>
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

export default function SettingsContent() {
  makeClickthrough();

  const settingsState = useSelector(getSettings);
  const dispatch = useDispatch();

  const [expanded, setExpanded] = useState(0);
  const [username, setUsername] = useState(
    settingsState?.currentUser?.username
  );
  const [email, setEmail] = useState(settingsState?.currentUser?.email);

  const [profilePictureError, setProfilePictureError] = useState(null);
  const [usernameError, setUsernameError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [spotifyError, setSpotifyError] = useState(null);
  const [formFilled, setFormFilled] = useState(false);

  useEffect(() => {
    dispatch(setSettingsContentMain(settings[expanded]?.title) || 'General');
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
          dispatch(setProfilePictureMain(res.data.profilePicture));
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

  const toggleConnectSpotifyErrorHandler = (e, error) => {
    setSpotifyError(error);
  };

  const browserIconOnClickHandler = (browser = 'Chrome') => {
    dispatch(setBrowserMain(browser));
  };

  useEffect(() => {
    ipcRenderer.on('quickSetting', quickSettingHandler);
    ipcRenderer.on(
      'toggleconnectspotifyerror:fromrenderer',
      toggleConnectSpotifyErrorHandler
    );

    return () => {
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
                <div onClick={() => setExpanded(index)}>
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
            <div className={styles.contentHeader}>
              {settingsState.settingsContent}
              {settingsState.settingsContent === 'Set-up' && (
                <SetupSettingsHeader
                  browser={settingsState.browser}
                  browserIconOnClickHandler={browserIconOnClickHandler}
                />
              )}
            </div>

            <AnimatePresence>
              {settingsState.settingsContent && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  layout
                >
                  {settingsState.settingsContent === 'General' && (
                    <GeneralSettingsContent />
                  )}
                  {settingsState.settingsContent === 'Account' && (
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
                  )}
                  {settingsState.settingsContent === 'Set-up' && (
                    <SetupSettingsContent
                      browser={settingsState.browser}
                      storedID={settingsState.extensionID}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            {/* <AnimationWrapper key={0}>
              {settingsState.settingsContent === 'General' && (
                <GeneralSettingsContent />
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
