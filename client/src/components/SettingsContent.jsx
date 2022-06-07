import React, { useState, useEffect, useRef } from 'react';
import { css } from '@stitches/react';
import { motion } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize';

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
import { getBase64 } from '../helpers/fileManager';
import { useBrowserWindow } from '../contexts/BrowserWindowContext';

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
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
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
  );
};

export default function SettingsContent() {
  const settingsState = useSelector(getSettings);
  const dispatch = useDispatch();

  const [expanded, setExpanded] = useState(false);
  const [username, setUsername] = useState(settingsState.currentUser.username);
  const [email, setEmail] = useState(settingsState.currentUser.email);

  const fileInputRef = useRef(null);

  ipcRenderer.on('quickSetting', (e, quickSetting) => {
    if (quickSetting === 'profilePictureClicked') fileInputRef?.current.click();
  });

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
