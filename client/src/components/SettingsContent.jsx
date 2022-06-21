import React, { useState, useEffect, useRef } from 'react';
import { css } from '@stitches/react';
import { motion } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize';
import { BsSpotify } from 'react-icons/bs';

import UserItem from './UserItem';
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

const container = css({
  backgroundColor: colors.offWhite,
});

const menuAndContentContainer = css({
  display: 'flex',
  flexDirection: 'row',
});
const menu = css({
  paddingTop: 12,
  flexDirection: 'column',
  width: '120px',
  backgroundColor: colors.offWhitePressed,
});
const menuHeader = css({
  color: colors.darkmodeDisabledBlack,
  fontSize: '0.6em',
  fontWeight: 'bold',
  textAlign: 'right',
  paddingTop: 12,
  paddingRight: 10,
  paddingBottom: 4,
});
const contentContainer = css({
  padding: 24,
  flex: 1,
});
const contentHeader = css({
  // fontWeight: 'bold',
  fontSize: '1.2em',
  color: colors.darkmodeLightBlack,
  paddingBottom: 12,
});

const profilePictureFormContainer = css({
  backgroundColor: colors.offWhitePressed,
  borderRadius: '2px',
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  marginBottom: 8,
});
const avatarContainer = css({
  margin: 'auto',
  paddingLeft: 6,
  '&:hover': {
    cursor: 'pointer',
    backgroundColor: colors.darkmodeFocused,
  },
});
const inputsContainer = css({
  flexDirection: 'row',
  paddingRight: 8,
  margin: 6,
});
const genericInput = css({
  width: '100%',
  paddingTop: 5,
  paddingBottom: 5,
  paddingLeft: 5,
  transition: 'background-color 0.15s ease',
  color: colors.darkmodeLightBlack,
  fontFamily: 'inherit',

  '&:hover, &:focus': {
    backgroundColor: colors.offWhitePressed,
    color: colors.darkmodeBlack,
  },
});

const AccountSettingsContent = ({
  username,
  email,
  handleNameChange,
  handleEmailChange,
  dispatch,
  settingsState,
  fileInputRef,
}) => {
  const connectedToSpotify = settingsState.currentUser?.spotifyAccessToken;

  const handleFileUpload = (evt) => {
    const file = Array.from(evt.target.files)[0];

    if (file) {
      let formData = new FormData();
      formData.append('userID', settingsState.currentUser._id);
      formData.append('profilePicture', file, file.name);

      settingsDao
        .setProfilePicture(formData, settingsState.currentUser.accessToken)
        .then((res) => {
          dispatch(setProfilePictureMain(res.data));
        })
        .catch((e) => console.error(e));
    }
  };

  return (
    <>
      <div className={profilePictureFormContainer()}>
        <motion.div className={avatarContainer()}>
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
            onChange={handleFileUpload}
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
        <div className={inputsContainer()}>
          <TextareaAutosize
            spellCheck="false"
            placeholder="Username"
            maxLength={25}
            maxRows={1}
            value={username || ''}
            className={genericInput()}
            onChange={handleNameChange}
          />
          <TextareaAutosize
            spellCheck="false"
            placeholder="Email"
            maxLength={25}
            maxRows={1}
            value={email || ''}
            className={genericInput()}
            onChange={handleEmailChange}
          />
        </div>
      </div>
      <motion.div
        style={{
          // border:
          //   '2px solid ' + connectedToSpotify
          //     ? colors.offWhitePressed2
          //     : colors.pastelGreen,
          color: connectedToSpotify
            ? colors.pastelGreen
            : colors.offWhitePressed2,
          borderRadius: '2px',
          padding: 6,
          paddingRight: 6,
          display: 'flex',
          flexDirection: 'row',
          // justifyContent: 'space-between',
          // alignItems: 'center', connect text looks more centered without this lmao
          fontSize: '0.9em',
        }}
        whileHover={{
          borderColor: colors.pastelGreen,
          color: colors.pastelGreen,
          cursor: 'pointer',
        }}
        whileTap={animations.whileTap}
        transition={{ duration: 0.15 }}
        onClick={() => ipcRenderer.send('toggleconnectspotify:fromrenderer')}
      >
        <BsSpotify size={'18px'} style={{ paddingRight: 6 }} />
        {connectedToSpotify ? 'connected' : 'connect'}
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

  const fileInputRef = useRef(null);

  const handleEscapeKey = (evt) => {
    if (evt.keyCode === 27) {
      BrowserWindow.getFocusedWindow().close();
    }
  };

  const handleNameChange = (evt) => {
    let newUsername = evt.target.value;

    settingsDao
      .setUsername(
        settingsState.currentUser._id,
        newUsername,
        settingsState.currentUser.accessToken
      )
      .then((res) => {
        dispatch(setUsernameMain(res.data));
      })
      .catch((e) => console.error(e));

    setUsername(evt.target.value);
  };

  const handleEmailChange = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    let newEmail = evt.target.value;

    settingsDao
      .setEmail(
        settingsState.currentUser._id,
        newEmail,
        settingsState.currentUser.accessToken
      )
      .then((res) => {
        dispatch(setEmailMain(res.data));
      })
      .catch((e) => console.error(e));

    setEmail(evt.target.value);
  };

  const quickSettingHandler = (e, quickSetting) => {
    if (quickSetting === 'profilePictureClicked') fileInputRef?.current.click();
  };

  useEffect(() => {
    ipcRenderer.on('quickSetting', quickSettingHandler);

    return () =>
      ipcRenderer.removeAllListeners('quickSetting', quickSettingHandler);
  }, []);

  return (
    <div className={container()} onKeyDown={handleEscapeKey}>
      <WindowFrame>
        <div className={menuAndContentContainer()}>
          <div className={menu()}>
            <div className={menuHeader()}>SETTINGS</div>
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
          <div className={contentContainer()}>
            <div className={contentHeader()}>
              {settingsState.settingsContent}
            </div>
            {settingsState.settingsContent === 'Account' && (
              <AccountSettingsContent
                fileInputRef={fileInputRef}
                handleNameChange={handleNameChange}
                handleEmailChange={handleEmailChange}
                username={username}
                email={email}
                dispatch={dispatch}
                settingsState={settingsState}
              />
            )}
          </div>
        </div>
      </WindowFrame>
    </div>
  );
}
