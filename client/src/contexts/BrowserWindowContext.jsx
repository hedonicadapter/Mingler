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
  width: 475,
  height: 510,
  webPreferences: {
    nodeIntegration: true,
    enableRemoteModule: true,
    devTools: false,
  },
};

const findFriendsWindowConfig = {
  show: false,
  frame: false,
  transparent: true,
  width: 460,
  // height: 634,
  webPreferences: {
    nodeIntegration: true,
    enableRemoteModule: true,
    // devTools: false,
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

  const settingsWindowFocusHandler = () => {
    dispatch(settingsFocusedTrue());
    electron.remote.getCurrentWindow().moveTop();
  };

  const settingsWindowBlurHandler = () => {
    dispatch(settingsFocusedFalse());
    if (!electron.remote.getCurrentWindow().isFocused()) {
      dispatch(appVisibleFalse());
    }
  };

  const settingsWindowCloseHandler = () => {
    dispatch(settingsOpenFalse());
  };
  const settingsWindowClosedHandler = () => {
    setSettingsWindow(new BrowserWindow(settingsWindowConfig));
    dispatch(settingsOpenFalse());
  };

  const findFriendsWindowCloseHandler = () => {
    dispatch(findFriendsOpenFalse());
  };
  const findFriendsWindowClosedHandler = () => {
    setFindFriendsWindow(new BrowserWindow(findFriendsWindowConfig));
    dispatch(findFriendsOpenFalse());
  };

  const toggleConnectSpotifyHandler = () => {
    toggleConnectSpotify();
  };

  useEffect(() => {
    if (!settingsWindow) return;

    loadSettingsContent();

    settingsWindow.on('focus', settingsWindowFocusHandler);
    settingsWindow.on('blur', settingsWindowBlurHandler);

    settingsWindow.on('close', settingsWindowCloseHandler);
    settingsWindow.on('closed', settingsWindowClosedHandler);

    return () => {
      settingsWindow.removeListener('focus', settingsWindowFocusHandler);
      settingsWindow.removeListener('blur', settingsWindowBlurHandler);
      settingsWindow.removeListener('close', settingsWindowCloseHandler);
      settingsWindow.removeListener('closed', settingsWindowClosedHandler);
      !settingsWindow.isDestroyed() && settingsWindow.close();
    };
  }, [settingsWindow]);

  useEffect(() => {
    if (!findFriendsWindow) return;

    loadFindFriendsContent();

    findFriendsWindow.on('close', findFriendsWindowCloseHandler);
    findFriendsWindow.on('closed', findFriendsWindowClosedHandler);

    return () => {
      findFriendsWindow.removeListener('close', findFriendsWindowCloseHandler);
      findFriendsWindow.removeListener(
        'closed',
        findFriendsWindowClosedHandler
      );
      !findFriendsWindow.isDestroyed() && findFriendsWindow.close();
    };
  }, [findFriendsWindow]);

  useEffect(() => {
    if (findFriendsWindow?.isVisible())
      findFriendsWindow.webContents.send('friends', friends);
  }, [friends, findFriendsWindow]);

  useEffect(() => {
    ipcRenderer.on(
      'toggleconnectspotify:frommain',
      toggleConnectSpotifyHandler
    );

    return () => {
      ipcRenderer.removeAllListeners(
        'toggleconnectspotify:frommain',
        toggleConnectSpotifyHandler
      );
    };
  }, []);

  const loadSettingsContent = () => {
    settingsWindow
      .loadURL(`file://${app.getAppPath()}/index.html#/settings`)
      .then()
      .catch(console.warn);

    settingsWindow.once('ready-to-show', () => {
      settingsWindow.setTitle('Settings');
    });
  };

  const toggleSettings = (page = 'General', quickSetting = false) => {
    dispatch(setSettingsContentMain(page));

    if (!appState.settingsOpen) {
      settingsWindow.show();
      dispatch(settingsOpenTrue());
    } else if (appState.settingsOpen && !settingsWindow?.isVisible()) {
      settingsWindow.show();
    } else settingsWindow.focus();

    if (!quickSetting) return;
    settingsWindow.webContents.send('quickSetting', quickSetting);
  };

  const loadFindFriendsContent = () => {
    findFriendsWindow
      .loadURL(`file://${app.getAppPath()}/index.html#/findfriends`)
      .then()
      .catch(console.warn);

    findFriendsWindow.once('ready-to-show', () => {
      findFriendsWindow.setTitle('Find friends');
    });
  };

  const toggleFindFriends = () => {
    if (!appState.findFriendsOpen) {
      findFriendsWindow.show();
      dispatch(findFriendsOpenTrue());
    } else if (appState.findFriendsOpen && !findFriendsWindow?.isVisible()) {
      findFriendsWindow.show();
    } else findFriendsWindow.focus();
  };

  const sendSpotifyError = (e = '') => {
    const error = e?.response?.data?.error;

    if (error) {
      settingsWindow.webContents.send(
        'toggleconnectspotifyerror:fromrenderer',
        error
      );
      // if 'error' isn't defined, it means the client didn't receive a response,
      // and the error is elsewhere, like a client side network error
    } else {
      settingsWindow.webContents.send(
        'toggleconnectspotifyerror:fromrenderer',
        e?.message
      );
    }
  };

  const loadConnectSpotifyContent = () => {
    DAO.createSpotifyURL(currentUser.accessToken)
      .then(async (res) => {
        if (res?.data?.success) {
          connectSpotifyWindow
            .loadURL(res.data.authorizeURL)
            .then()
            .catch((e) => sendSpotifyError(e));

          await connectSpotifyWindow.once('ready-to-show', () => {
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

            DAO.authorizeSpotify(code, currentUser._id, currentUser.accessToken)
              .then((result) => {
                console.log('spotiffff ', result);
                if (result.data.success) {
                  dispatch(
                    setSpotifyAccessTokenMain(result.data.body['access_token'])
                  );
                  dispatch(
                    setSpotifyRefreshTokenMain(
                      result.data.body['refresh_token']
                    )
                  );
                  dispatch(
                    setSpotifyExpiryDate(result.data.body['spotifyExpiryDate'])
                  );
                  activeTrackListener(result.data.body['access_token']);
                }
              })
              .catch((e) => {
                sendSpotifyError(e);
              })
              .finally(() => connectSpotifyWindow.close());
          });
        }
      })
      .catch((e) => {
        sendSpotifyError(e);
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
