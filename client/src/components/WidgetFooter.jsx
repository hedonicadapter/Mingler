import React, { useEffect, useState } from 'react';
import { css } from '@stitches/react';

import colors from '../config/colors';
import { useDispatch } from 'react-redux';
import {
  appVisibleFalse,
  settingsFocusedFalse,
  settingsFocusedTrue,
  settingsOpenFalse,
  settingsOpenTrue,
} from '../mainState/features/appSlice';

const electron = require('electron');
const app = electron.remote.app;
const BrowserWindow = electron.remote.BrowserWindow;

const container = css({
  backgroundColor: 'transparent',
  flex: 1,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
});
const button = css({
  pointerEvents: 'auto',
  color: colors.darkmodeMediumWhite,
  alignSelf: 'flex-end',
});

const settingsWindowConfig = {
  title: 'Settings',
  show: false,
  frame: false,
  transparent: true,
  width: 560,
  webPreferences: {
    nodeIntegration: true,
    enableRemoteModule: true,
  },
};

export default function WidgetFooter() {
  const dispatch = useDispatch();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsWindow, setSettingsWindow] = useState(
    new BrowserWindow(settingsWindowConfig)
  );

  useEffect(() => {
    settingsWindow?.removeAllListeners();

    settingsWindow?.on('focus', () => {
      dispatch(settingsFocusedTrue());
    });

    settingsWindow?.on('blur', () => {
      dispatch(settingsFocusedFalse());
      if (!electron.remote.getCurrentWindow().isFocused()) {
        dispatch(appVisibleFalse());
      }
    });
  }, [settingsWindow]);

  const toggleSettings = () => {
    if (!settingsOpen) {
      settingsWindow.on('close', function () {
        setSettingsWindow(null);
        dispatch(settingsOpenFalse());
      });
      settingsWindow.on('closed', function () {
        setSettingsWindow(new BrowserWindow(settingsWindowConfig));
        setSettingsOpen(false);
        dispatch(settingsOpenFalse());
      });
      settingsWindow.loadURL(`file://${app.getAppPath()}/index.html#/settings`);

      settingsWindow.once('ready-to-show', () => {
        settingsWindow.setTitle('Settings');
        // settingsWindow.webContents.send('focus', searchValue);

        settingsWindow.show();
        setSettingsOpen(true);
        dispatch(settingsOpenTrue());
      });
    } else settingsWindow.focus();
  };

  const handleSettingsButton = () => {
    toggleSettings();
  };

  return (
    <footer className={container()}>
      <div className={button()} onClick={handleSettingsButton}>
        settings ⚙
      </div>
    </footer>
  );
}
