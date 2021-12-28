import React, { useState, useEffect } from 'react';
import { css } from '@stitches/react';
import { motion } from 'framer-motion';
import { VscChromeMinimize } from 'react-icons/vsc';
import { BsCircle } from 'react-icons/bs';
import { IoIosClose } from 'react-icons/io';

import UserItem from './UserItem';
import { useLocalStorage } from '../helpers/localStorageManager';
import DAO from '../config/DAO';
import colors from '../config/colors';
import { useDispatch, useSelector } from 'react-redux';
import { WindowFrame } from './reusables/WindowFrame';
import AccordionSetting from './AccordionSetting';
import Avatar from 'react-avatar';

const { remote } = require('electron');
const BrowserWindow = remote.BrowserWindow;
const ipcRenderer = require('electron').ipcRenderer;

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
const settings = [{ title: 'General' }, { title: 'Account' }];

const AccountSettingsContent = ({ name }) => {
  const profilePictureFormContainer = css({});

  return (
    <div className={profilePictureFormContainer()}>
      <Avatar name={name} size="60" />
    </div>
  );
};

export default function SettingsWindow() {
  const [content, setContent] = useState('General');

  const settingsState = useSelector((state) => state);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('store ', settingsState);
  }, [settingsState]);
  useEffect(() => {
    console.log(content);
  }, [content]);

  const handleEscapeKey = (evt) => {
    if (evt.keyCode === 27) {
      BrowserWindow.getFocusedWindow().close();
    }
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
              <AccountSettingsContent name={currentUser.username} />
            )}
          </div>
        </div>
      </WindowFrame>
    </div>
  );
}
