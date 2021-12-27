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
import { bindActionCreators } from '@reduxjs/toolkit';
import ActionCreators from '../mainState/action-creators/ActionCreators';
import { FrameButtons } from './reusables/FrameButtons';

const { remote } = require('electron');
const BrowserWindow = remote.BrowserWindow;
const ipcRenderer = require('electron').ipcRenderer;

const container = css({
  backgroundColor: colors.darkmodeBlack,
});

export default function SettingsWindow() {
  const settingsState = useSelector((state) => state.settings);

  const dispatch = useDispatch();
  const AC = bindActionCreators(ActionCreators, dispatch);

  useEffect(() => {
    console.log(settingsState);
  }, [settingsState]);

  const handleEscapeKey = (evt) => {
    if (evt.keyCode === 27) {
      BrowserWindow.getFocusedWindow().close();
    }
  };

  return (
    <div className={container()} onKeyDown={handleEscapeKey}>
      <FrameButtons />
      LALALALALA
    </div>
  );
}
