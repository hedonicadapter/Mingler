import React, { useState, useEffect } from 'react';
import { css } from '@stitches/react';
import { motion } from 'framer-motion';
import { VscChromeMinimize } from 'react-icons/vsc';
import { BsCircle } from 'react-icons/bs';
import { IoIosClose } from 'react-icons/io';
import TextareaAutosize from 'react-textarea-autosize';

import UserItem from './UserItem';
import { useLocalStorage } from '../helpers/localStorageManager';
import colors from '../config/colors';
import { useDispatch, useSelector } from 'react-redux';
import { WindowFrame } from './reusables/WindowFrame';
import AccordionSetting from './AccordionSetting';
import Avatar from 'react-avatar';
import {
  getSettings,
  setUsernameMain,
} from '../mainState/features/settingsSlice';
import settingsDao from '../config/settingsDao';

const { remote } = require('electron');
const BrowserWindow = remote.BrowserWindow;
const ipcRenderer = require('electron').ipcRenderer;

const settings = [{ title: 'General' }, { title: 'Account' }];

const container = css({
  backgroundColor: colors.darkmodeBlack,
});

const menuAndContentContainer = css({
  display: 'flex',
  flexDirection: 'row',
});
const menu = css({
  paddingTop: 12,
  flexDirection: 'column',
  width: '120px',
  backgroundColor: colors.darkmodeLightBlack,
});
const menuHeader = css({
  color: colors.darkmodeDisabledBlack,
  fontSize: '0.7em',
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
  fontWeight: 'bold',
  fontSize: '1.2em',
  color: colors.darkmodeHighWhite,
  paddingBottom: 14,
});

const profilePictureFormContainer = css({
  width: '200px',
  backgroundColor: colors.darkmodeLightBlack,
  display: 'flex',
  flexDirection: 'row',
});
const avatarContainer = css({
  '&:hover': {
    cursor: 'pointer',
    backgroundColor: colors.darkmodeFocused,
  },
});
const nameInput = css({
  padding: 6,
  margin: 6,
  transition: 'background-color 0.15s ease',
  color: colors.darkmodeMediumWhite,

  '&:hover, &:focus': {
    backgroundColor: colors.darkmodeFocused,
    color: colors.darkmodeHighWhite,
  },
});

const AccountSettingsContent = ({ username, handleNameChange }) => {
  const [profilePicture, setProfilePicture] = useState(null);

  const handleFileUpload = (evt) => {
    const files = Array.from(evt.target.files);
    if (files[0]) setProfilePicture(files[0].path);
  };

  return (
    <div className={profilePictureFormContainer()}>
      <motion.div
        className={avatarContainer()}
        whileHover={{ outlineColor: 'rgba(0,0,0,1)' }}
        style={{ outline: '4px solid rgba(0,0,0,0)' }}
      >
        <motion.label
          whileHover={{ cursor: 'pointer' }}
          htmlFor="file-upload"
          className="custom-file-upload"
        >
          <Avatar name={username} size="60" src={profilePicture} />
        </motion.label>
        <input
          onChange={handleFileUpload}
          accept="image/*"
          id="file-upload"
          type="file"
          style={{ opacity: 0, position: 'absolute', zIndex: -1 }}
        />
      </motion.div>

      <TextareaAutosize
        spellCheck="false"
        placeholder="Username"
        maxLength={25}
        value={username || ''}
        className={nameInput()}
        onChange={handleNameChange}
      />
    </div>
  );
};

export default function SettingsContent() {
  const settingsState = useSelector(getSettings);
  const dispatch = useDispatch();

  const [content, setContent] = useState('General');
  const [username, setUsername] = useState(
    settingsState.settings.currentUser.username
  );

  const handleEscapeKey = (evt) => {
    if (evt.keyCode === 27) {
      BrowserWindow.getFocusedWindow().close();
    }
  };

  const handleNameChange = (evt) => {
    let newUsername = evt.target.value;

    settingsDao
      .setUsername(
        settingsState.settings.currentUser._id,
        newUsername,
        settingsState.settings.currentUser.token
      )
      .then((res) => {
        dispatch(setUsernameMain(res.data));
      })
      .catch((e) => console.error(e));

    setUsername(evt.target.value);
  };

  return (
    <div className={container()} onKeyDown={handleEscapeKey}>
      <WindowFrame>
        <div className={menuAndContentContainer()}>
          <div className={menu()}>
            <div className={menuHeader()}>SETTINGS</div>
            {settings.map((setting, index) => {
              return (
                <div onClick={() => setContent(setting.title)}>
                  <AccordionSetting setting={setting} key={index} />
                </div>
              );
            })}
          </div>
          <div className={contentContainer()}>
            <div className={contentHeader()}>{content}</div>
            {content === 'Account' && (
              <AccountSettingsContent
                handleNameChange={handleNameChange}
                username={username}
              />
            )}
          </div>
        </div>
      </WindowFrame>
    </div>
  );
}
