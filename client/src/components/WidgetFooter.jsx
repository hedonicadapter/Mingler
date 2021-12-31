import React, { useEffect, useState } from 'react';
import { css } from '@stitches/react';

import colors from '../config/colors';

const electron = require('electron');
const app = electron.remote.app;
const BrowserWindow = electron.remote.BrowserWindow;

const container = css({
  backgroundColor: colors.darkmodeBlack,
  flex: 1,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
});
const button = css({
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsWindow, setSettingsWindow] = useState(
    new BrowserWindow(settingsWindowConfig)
  );

  const toggleSettings = () => {
    if (!settingsOpen) {
      settingsWindow.on('close', function () {
        setSettingsWindow(null);
      });
      settingsWindow.on('closed', function () {
        setSettingsWindow(new BrowserWindow(settingsWindowConfig));
        setSettingsOpen(false);
      });
      settingsWindow.loadURL(`file://${app.getAppPath()}/index.html#/settings`);

      settingsWindow.once('ready-to-show', () => {
        settingsWindow.setTitle('Settings');
        // settingsWindow.webContents.send('initialValue', searchValue);

        settingsWindow.show();
        setSettingsOpen(true);
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
