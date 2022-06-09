import React, { useContext, useState, useEffect, createContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  appVisibleFalse,
  appVisibleTrue,
  findFriendsOpenFalse,
  findFriendsOpenTrue,
  getApp,
  settingsFocusedFalse,
  settingsFocusedTrue,
  settingsOpenFalse,
  settingsOpenTrue,
} from '../mainState/features/appSlice';
import {
  getSettings,
  setSettingsContentMain,
} from '../mainState/features/settingsSlice';
import { useFriends } from './FriendsContext';

const electron = require('electron');
const app = electron.remote.app;
const BrowserWindow = electron.remote.BrowserWindow;
const ipcRenderer = electron.ipcRenderer;

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

const findFriendsWindowConfig = {
  show: false,
  frame: false,
  transparent: true,
  width: 460,
  webPreferences: {
    nodeIntegration: true,
    enableRemoteModule: true,
  },
};

export function BrowserWindowProvider({ children }) {
  const dispatch = useDispatch();

  const { friends } = useFriends();

  const appState = useSelector(getApp);
  const settingsState = useSelector(getSettings);

  const [settingsWindow, setSettingsWindow] = useState(
    new BrowserWindow(settingsWindowConfig)
  );

  const [findFriendsWindow, setFindFriendsWindow] = useState(
    new BrowserWindow(findFriendsWindowConfig)
  );

  useEffect(() => {
    settingsWindow?.removeAllListeners();
    settingsWindow?.on('focus', () => {
      dispatch(settingsFocusedTrue());
      electron.remote.getCurrentWindow().focus();
    });
    settingsWindow?.on('blur', (e) => {
      console.log('blurred for no reason ', e);
      dispatch(settingsFocusedFalse());
      if (!electron.remote.getCurrentWindow().isFocused()) {
        dispatch(appVisibleFalse());
      }
    });
  }, [settingsWindow]);

  useEffect(() => {
    if (findFriendsWindow?.isVisible())
      findFriendsWindow.webContents.send('friends', friends);
  }, [friends, findFriendsWindow]);

  const loadSettingsContent = (quickSetting) => {
    settingsWindow.loadURL(`file://${app.getAppPath()}/index.html#/settings`);

    settingsWindow.once('ready-to-show', () => {
      settingsWindow.setTitle('Settings');

      settingsWindow.show();
      dispatch(settingsOpenTrue());

      if (!quickSetting) return;
      settingsWindow.webContents.send('quickSetting', quickSetting);
    });

    settingsWindow.on('close', function () {
      dispatch(settingsOpenFalse());
      setSettingsWindow(null);
    });

    settingsWindow.on('closed', function () {
      setSettingsWindow(new BrowserWindow(settingsWindowConfig));
      dispatch(settingsOpenFalse());
    });
  };

  const toggleSettings = (page = 'General', quickSetting = false) => {
    dispatch(setSettingsContentMain(page));

    if (!appState.settingsOpen) {
      loadSettingsContent(quickSetting);
    } else if (appState.settingsOpen && !settingsWindow.isVisible()) {
      loadSettingsContent(quickSetting);
    } else settingsWindow.focus();
  };

  const loadFindFriendsContent = () => {
    findFriendsWindow.loadURL(
      `file://${app.getAppPath()}/index.html#/findfriends`
    );

    findFriendsWindow.once('ready-to-show', () => {
      findFriendsWindow.setTitle('Find friends');

      findFriendsWindow.show();
      dispatch(findFriendsOpenTrue());
    });

    findFriendsWindow.on('close', function () {
      dispatch(findFriendsOpenFalse());
      setFindFriendsWindow(null);
    });

    findFriendsWindow.on('closed', function () {
      setFindFriendsWindow(new BrowserWindow(findFriendsWindowConfig));
      dispatch(findFriendsOpenFalse());
    });
  };

  const toggleFindFriends = () => {
    // ipcRenderer.send('findFriendsWindow:toggle');
    if (!appState.findFriendsOpen) {
      loadFindFriendsContent();
    } else if (appState.findFriendsOpen && !findFriendsWindow.isVisible()) {
      loadFindFriendsContent();
    } else findFriendsWindow.focus();
  };

  const value = { toggleSettings, toggleFindFriends };

  return (
    <BrowserWindowContext.Provider value={value}>
      {children}
    </BrowserWindowContext.Provider>
  );
}
