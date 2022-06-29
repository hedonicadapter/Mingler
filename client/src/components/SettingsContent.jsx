import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize';
import { BsSpotify } from 'react-icons/bs';

import styles from './SettingsContent.module.css';
import { useLocalStorage } from '../helpers/localStorageManager';
import colors from '../config/colors';
import { useDispatch, useSelector } from 'react-redux';
import { WindowFrame } from './reusables/WindowFrame';
import AccordionSetting from './AccordionSetting';
import Avatar from 'react-avatar';
import {
  getCurrentUser,
  getSettings,
  setProfilePictureMain,
  setUsernameMain,
  setEmailMain,
  setSettingsContentMain,
} from '../mainState/features/settingsSlice';
import settingsDao from '../config/settingsDao';
import { useBrowserWindow } from '../contexts/BrowserWindowContext';
import { makeClickthrough } from '../config/clickthrough';
import animations from '../config/animations';

const { remote } = require('electron');
const BrowserWindow = remote.BrowserWindow;
const ipcRenderer = require('electron').ipcRenderer;

const settings = [{ title: 'General' }, { title: 'Account' }];

const AccountSettingsContent = ({
  username,
  email,
  handleProfilePictureChange,
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
  const [connectedToSpotify, setConnectedToSpotify] = useState(
    settingsState.currentUser?.spotifyAccessToken
  );

  useEffect(() => {
    setConnectedToSpotify(settingsState.currentUser?.spotifyAccessToken);
  }, [settingsState.currentUser?.spotifyAccessToken]);

  return (
    <>
      <div className={styles.profilePictureFormContainer}>
        <motion.div className={styles.avatarContainer}>
          <motion.label
            whileHover={{ cursor: 'pointer' }}
            htmlFor="file-upload"
            className="custom-file-upload"
            ref={fileInputRef}
          >
            <Avatar
              round
              name={username}
              size="58"
              src={settingsState.currentUser.profilePicture}
            />
          </motion.label>
          <input
            onChange={handleProfilePictureChange}
            onFocus={(evt) => evt.preventDefault()}
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
              className={styles.genericInput}
              readOnly={emailError ? true : false}
              value={emailError ? emailError : email || ''}
              style={{
                color: emailError
                  ? colors.coffeeRed
                  : colors.darkmodeLightBlack,
                cursor: emailError ? 'default' : 'auto',
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
      >
        <BsSpotify size={'18px'} style={{ paddingRight: 6 }} />
        {spotifyError
          ? spotifyError
          : connectedToSpotify
          ? 'connected'
          : 'connect'}
      </motion.div>
    </>
  );
};

export default function SettingsContent() {
  makeClickthrough();

  const settingsState = useSelector(getSettings);
  const dispatch = useDispatch();

  const [expanded, setExpanded] = useState(false);
  const [username, setUsername] = useState(
    settingsState?.currentUser?.username
  );
  const [email, setEmail] = useState(settingsState?.currentUser?.email);

  const [profilePictureError, setProfilePictureError] = useState(null);
  const [usernameError, setUsernameError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [spotifyError, setSpotifyError] = useState(null);

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

  const handleProfilePictureChange = (evt) => {
    const file = Array.from(evt.target.files)[0];

    if (file) {
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
    if (quickSetting === 'profilePictureClicked') fileInputRef?.current.click();
  };
  const toggleConnectSpotifyErrorHandler = (e, error) => {
    setSpotifyError(error);
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
      <WindowFrame>
        <div className={styles.menuAndContentContainer}>
          <div className={styles.menu}>
            {settings.map((setting, index) => {
              return (
                <div
                  onClick={() =>
                    dispatch(setSettingsContentMain(setting.title))
                  }
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
            <div className={styles.contentHeader}>
              {settingsState.settingsContent}
            </div>
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
            {settingsState.settingsContent === 'General' && (
              <div
                style={{
                  fontSize: '0.9em',
                  color: colors.defaultPlaceholderTextColor,
                }}
              >
                Nothing to see here yet.
              </div>
            )}
          </div>
        </div>
      </WindowFrame>
    </div>
  );
}
