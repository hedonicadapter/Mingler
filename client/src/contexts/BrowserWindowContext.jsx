import React, { useContext, useState, useEffect, createContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  appVisibleFalse,
  getApp,
  settingsFocusedFalse,
  settingsFocusedTrue,
  settingsOpenFalse,
  settingsOpenTrue,
} from '../mainState/features/appSlice';

const electron = require('electron');
const app = electron.remote.app;
const BrowserWindow = electron.remote.BrowserWindow;

const BrowserWindowContext = createContext();
export function useBrowserWindow() {
  return useContext(BrowserWindowContext);
}

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

export function BrowserWindowProvider({ children }) {
  const dispatch = useDispatch();

  const appState = useSelector(getApp);
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
    if (!appState.settingsOpen) {
      settingsWindow.loadURL(`file://${app.getAppPath()}/index.html#/settings`);

      settingsWindow.once('ready-to-show', () => {
        settingsWindow.setTitle('Settings');

        settingsWindow.show();
        dispatch(settingsOpenTrue());
      });

      settingsWindow.on('close', function () {
        setSettingsWindow(null);
        dispatch(settingsOpenFalse());
      });

      settingsWindow.on('closed', function () {
        setSettingsWindow(new BrowserWindow(settingsWindowConfig));
        dispatch(settingsOpenFalse());
      });
    } else {
      settingsWindow.focus();
    }
  };

  const value = { toggleSettings };

  return (
    <BrowserWindowContext.Provider value={value}>
      {children}
    </BrowserWindowContext.Provider>
  );
}
