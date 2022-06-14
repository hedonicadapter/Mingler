import React, { useContext, useState, useEffect, createContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DAO from '../config/DAO';
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
  getCurrentUser,
  getSettings,
  setSettingsContentMain,
  setSpotifyAccessTokenMain,
  setSpotifyExpiryDate,
  setSpotifyRefreshTokenMain,
} from '../mainState/features/settingsSlice';
import { useFriends } from './FriendsContext';
import { useStatus } from './UserStatusContext';

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

const connectSpotifyWindowConfig = {
  show: false,
};

export function BrowserWindowProvider({ children }) {
  const dispatch = useDispatch();

  const { friends } = useFriends();
  const { activeTrackListener } = useStatus();

  const appState = useSelector(getApp);
  const settingsState = useSelector(getSettings);
  const currentUser = useSelector(getCurrentUser);

  const [settingsWindow, setSettingsWindow] = useState(
    new BrowserWindow(settingsWindowConfig)
  );

  const [findFriendsWindow, setFindFriendsWindow] = useState(
    new BrowserWindow(findFriendsWindowConfig)
  );

  const [connectSpotifyWindow, setConnectSpotifyWindow] = useState(
    new BrowserWindow(connectSpotifyWindowConfig)
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

  const loadConnectSpotifyContent = () => {
    DAO.createSpotifyURL(currentUser.accessToken)
      .then((res) => {
        console.log('res.data ', res.data);
        connectSpotifyWindow.loadURL(res.data);

        connectSpotifyWindow.once('ready-to-show', () => {
          connectSpotifyWindow.setTitle('Connect to Spotify');

          connectSpotifyWindow.show();

          let currentUrl = connectSpotifyWindow.webContents.getURL();
          let code;

          if (currentUrl.includes('localhost:')) {
            code = currentUrl.substring(currentUrl.indexOf('=') + 1);
          } else {
            connectSpotifyWindow.webContents.once(
              'will-redirect',
              (event, url) => {
                connectSpotifyWindow.webContents.once('dom-ready', () => {
                  // get only the string content after "="
                  code = url.substring(url.indexOf('=') + 1);
                  //localhost:1212/?code=AQC9QkkbHZT2A6sYJLo8Rd0taIkkbgRTReRx6Lw9QyiUwHykeCXdw55bEk6CBJjYS5sXDyzQPAjkt-QVzNcUzZDSzUeMqdfs2RKjyM9EnDKhI4dbnzk9cZMGSjeldKq_8B6eRRU2hD_imYqVIE-mGxYioZ9n_w_lzIzRJt4dXNpNyDiee9FZF9hxuq-kDSOX8QPVGqsmles7I9SSbQXtRg9R0LHSjS-wO62GA-mUZtAiefCsrINxDOjRaMyBJRZ31PeerArXZACX8tTSqQ
                });
              }
            );
          }

          // TODO: dateBySecondsFromNow is formatted server-side, might not need this here if mongodb sends dates as is
          DAO.authorizeSpotify(code, currentUser._id, currentUser.accessToken)
            .then((result) => {
              dispatch(
                setSpotifyAccessTokenMain(result.data.body['access_token'])
              );
              dispatch(
                setSpotifyRefreshTokenMain(result.data.body['refresh_token'])
              );
              dispatch(
                setSpotifyExpiryDate(result.data.body['spotifyExpiryDate'])
              );
              activeTrackListener(result.data.body['access_token']);
            })
            .catch(console.log);

          connectSpotifyWindow.close();
        });
      })
      .catch(console.log);

    connectSpotifyWindow.on('close', function () {
      setConnectSpotifyWindow(null);
    });

    connectSpotifyWindow.on('closed', function () {
      setConnectSpotifyWindow(new BrowserWindow(connectSpotifyWindowConfig));
    });
  };

  const toggleConnectSpotify = () => {
    loadConnectSpotifyContent();
  };

  const value = { toggleSettings, toggleFindFriends, toggleConnectSpotify };

  return (
    <BrowserWindowContext.Provider value={value}>
      {children}
    </BrowserWindowContext.Provider>
  );
}
