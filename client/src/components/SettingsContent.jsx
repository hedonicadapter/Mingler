import React, { useState, useEffect, useRef } from 'react';
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
  getCurrentUser,
  getSettings,
  setProfilePictureMain,
  setUsernameMain,
  setEmailMain,
} from '../mainState/features/settingsSlice';
import settingsDao from '../config/settingsDao';
import { getBase64 } from '../helpers/fileManager';

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
const genericInput = css({
  padding: 6,
  margin: 6,
  transition: 'background-color 0.15s ease',
  color: colors.darkmodeMediumWhite,

  '&:hover, &:focus': {
    backgroundColor: colors.darkmodeFocused,
    color: colors.darkmodeHighWhite,
  },
});

const AccountSettingsContent = ({
  username,
  email,
  handleNameChange,
  handleEmailChange,
}) => {
  const currentUser = useSelector((state) => getCurrentUser(state));
  const dispatch = useDispatch();

  const image = useRef(undefined);

  useEffect(() => {
    console.log('pp ', currentUser.profilePicture);
  }, [currentUser]);

  const handleFileUpload = (evt) => {
    const file = Array.from(evt.target.files)[0];

    if (file) {
      // getBase64(files[0])
      // .then((profilePicture) => {
      let formData = new FormData();
      formData.append('userID', currentUser._id);
      formData.append('profilePicture', file, file.name);

      settingsDao
        .setProfilePicture(formData, currentUser.token)
        .then((res) => {
          console.log('data ', res.data);
          // const blob = new Blob([res.data]);
          // const url = URL.createObjectURL(blob);

          // dispatch(setProfilePictureMain(url));

          // image.current.src = url;
        })
        .catch((e) => console.error(e));
      // })
      // .catch((e) => console.error(e));
    }
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
          <Avatar name={username} size="60" src={currentUser.profilePicture} />
          <img
            ref={image}
            width={40}
            height={40}
            src={currentUser.profilePicture}
          />
        </motion.label>
        <input
          onChange={handleFileUpload}
          accept="image/*"
          id="file-upload"
          type="file"
          style={{ opacity: 0, position: 'absolute', zIndex: -1 }}
        />
      </motion.div>
      <div style={{ flexDirection: 'row' }}>
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
  const [content, setContent] = useState('General');
  const [username, setUsername] = useState(
    settingsState.settings.currentUser.username
  );
  const [email, setEmail] = useState(settingsState.settings.currentUser.email);

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

  const handleEmailChange = (evt) => {
    let newEmail = evt.target.value;

    settingsDao
      .setEmail(
        settingsState.settings.currentUser._id,
        newEmail,
        settingsState.settings.currentUser.token
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
                <div onClick={() => setContent(setting.title)}>
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
            <div className={contentHeader()}>{content}</div>
            {content === 'Account' && (
              <AccountSettingsContent
                handleNameChange={handleNameChange}
                handleEmailChange={handleEmailChange}
                username={username}
                email={email}
              />
            )}
          </div>
        </div>
      </WindowFrame>
    </div>
  );
}
