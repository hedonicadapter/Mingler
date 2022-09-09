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

const favicon = __dirname + '../../assets/icons/minglerReversed.ico';

const settingsWindowConfig = {
  title: 'Settings',
  show: false,
  frame: false,
  transparent: true,
  closable: false,
  width: 595,
  height: 510,
  icon: favicon,
  resizable: false,
  webPreferences: {
    contextIsolation: false,
    nodeIntegration: true,
    enableRemoteModule: true,
    devTools: true,
  },
};

const findFriendsWindowConfig = {
  title: 'Find friends',
  show: false,
  frame: false,
  transparent: true,
  closable: false,
  width: 460,
  // height: 634,
  icon: favicon,
  webPreferences: {
    contextIsolation: false,
    nodeIntegration: true,
    enableRemoteModule: true,
    devTools: false,
  },
};

const connectSpotifyWindowConfig = {
  height: 768,
  width: 550,
  title: 'Connect to Spotify',
  show: false,
  icon: favicon,
};

export function BrowserWindowProvider({ children }) {
  const dispatch = useDispatch();

  const { friends } = useFriends();
  const { activeTrackListener } = useStatus();

  const appState = useSelector(getApp);
  const settingsState = useSelector(getSettings);
  const currentUser = useSelector(getCurrentUser);

  const [readyToExit, setReadyToExit] = useState(false);

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
    ipcRenderer.send('settingsfocused:fromrenderer');
  };

  const settingsWindowBlurHandler = () => {
    dispatch(settingsFocusedFalse());
    if (!electron.remote.getCurrentWindow().isFocused()) {
      dispatch(appVisibleFalse());
      ipcRenderer.send('settingsblurred:fromrenderer');
    }
  };

  const hideWindow = (window) => {
    // window?.setOpacity(0);
    window?.setSkipTaskbar(true);
    if (process.platform == 'win32') window?.minimize();
    else if (process.platform == 'darwin') app?.hide();
    else window?.hide();
    // window?.blur();
  };

  const settingsWindowCloseHandler = (evt) => {
    hideWindow(settingsWindow);
  };
  const settingsWindowClosedHandler = () => {
    // setSettingsWindow(new BrowserWindow(settingsWindowConfig));
    // dispatch(settingsOpenFalse());
  };

  const findFriendsWindowCloseHandler = () => {
    hideWindow(findFriendsWindow);
  };
  const findFriendsWindowClosedHandler = () => {
    // setFindFriendsWindow(new BrowserWindow(findFriendsWindowConfig));
    // dispatch(findFriendsOpenFalse());
  };

  const connectSpotifyWindowCloseHandler = () => {
    setConnectSpotifyWindow(null);
  };

  const toggleConnectSpotifyHandler = () => {
    toggleConnectSpotify();
  };
  const disconnectSpotifyHandler = () => {
    dispatch(setSpotifyAccessTokenMain('disconnect'));
    dispatch(setSpotifyRefreshTokenMain(null));
    dispatch(setSpotifyExpiryDate(null));
    activeTrackListener('disconnect');
  };

  const traySettingsHandler = () => {
    toggleSettings();
  };

  useEffect(() => {
    // Clusterfuck of close handling to keep unclosability working
    ipcRenderer.once('exit:frommain', () => {
      if (!settingsWindow.isDestroyed()) {
        settingsWindow.removeListener('close', settingsWindowCloseHandler);
        settingsWindow.destroy();
        dispatch(settingsOpenFalse());
        setSettingsWindow(null);
      }
      if (!findFriendsWindow.isDestroyed()) {
        findFriendsWindow.removeListener(
          'close',
          findFriendsWindowCloseHandler
        );
        findFriendsWindow.destroy();
        dispatch(findFriendsOpenFalse());
        setFindFriendsWindow(null);
      }
      if (!connectSpotifyWindow.isDestroyed()) {
        connectSpotifyWindow?.close();
      }

      setReadyToExit(true);
    });
  }, []);

  useEffect(() => {
    console.log(
      !settingsWindow &&
        !findFriendsWindow &&
        !connectSpotifyWindow &&
        readyToExit
    );
    if (
      !settingsWindow &&
      !findFriendsWindow &&
      !connectSpotifyWindow &&
      readyToExit
    ) {
      ipcRenderer.send('exitready:fromrenderer');
    }
  }, [settingsWindow, findFriendsWindow, connectSpotifyWindow, readyToExit]);

  useEffect(() => {
    if (!settingsWindow) return;

    loadSettingsContent();

    settingsWindow.on('focus', settingsWindowFocusHandler);
    settingsWindow.on('blur', settingsWindowBlurHandler);

    settingsWindow.on('close', settingsWindowCloseHandler);
    // settingsWindow.on('closed', settingsWindowClosedHandler);

    return () => {
      settingsWindow.removeListener('focus', settingsWindowFocusHandler);
      settingsWindow.removeListener('blur', settingsWindowBlurHandler);
      settingsWindow.removeListener('close', settingsWindowCloseHandler);
      // settingsWindow.removeListener('closed', settingsWindowClosedHandler);
      !settingsWindow.isDestroyed() && settingsWindow.destroy();
    };
  }, [settingsWindow]);

  useEffect(() => {
    if (!findFriendsWindow) return;

    loadFindFriendsContent();

    findFriendsWindow.on('close', findFriendsWindowCloseHandler);
    // findFriendsWindow.on('closed', findFriendsWindowClosedHandler);

    return () => {
      findFriendsWindow.removeListener('close', findFriendsWindowCloseHandler);
      // findFriendsWindow.removeListener(
      //   'closed',
      //   findFriendsWindowClosedHandler
      // );
      !findFriendsWindow.isDestroyed() && findFriendsWindow.destroy();
    };
  }, [findFriendsWindow]);

  useEffect(() => {
    connectSpotifyWindow.on('close', connectSpotifyWindowCloseHandler);
    connectSpotifyWindow.webContents.on(
      'will-redirect',
      connectSpotifyWindowRedirectHandler
    );

    return () => {
      connectSpotifyWindow.removeListener(
        'close',
        connectSpotifyWindowCloseHandler
      );
      connectSpotifyWindow.webContents.removeListener(
        'will-redirect',
        connectSpotifyWindowRedirectHandler
      );
    };
  });

  useEffect(() => {
    if (findFriendsWindow?.isVisible())
      findFriendsWindow.webContents.send('friends', friends);
  }, [friends, findFriendsWindow]);

  useEffect(() => {
    ipcRenderer.on('tray:settings', traySettingsHandler);
    ipcRenderer.on(
      'toggleconnectspotify:frommain',
      toggleConnectSpotifyHandler
    );
    ipcRenderer.on('disconnectspotify:frommain', disconnectSpotifyHandler);

    return () => {
      ipcRenderer.removeAllListeners(
        'toggleconnectspotify:frommain',
        toggleConnectSpotifyHandler
      );
      ipcRenderer.removeAllListeners(
        'disconnectspotify:frommain',
        disconnectSpotifyHandler
      );
      ipcRenderer.removeAllListeners('tray:settings', traySettingsHandler);
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

  const toggleSettings = (page = 'Widget', quickSetting = false) => {
    dispatch(setSettingsContentMain(page));

    settingsWindow?.setSkipTaskbar(false);

    if (!appState.settingsOpen) {
      settingsWindow.show();
      dispatch(settingsOpenTrue());
    } else if (appState.settingsOpen && !settingsWindow?.isVisible()) {
      settingsWindow.show();
    } else {
      settingsWindow.focus();
    }

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
    findFriendsWindow?.setSkipTaskbar(false);

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

  const authorizeSpotify = (code) => {
    DAO.authorizeSpotify(code, currentUser._id, currentUser.accessToken)
      .then((result) => {
        hideWindow(connectSpotifyWindow);
        console.warn('spotiffff ', result);
        if (result.data.success) {
          dispatch(setSpotifyAccessTokenMain(result.data.body['access_token']));
          dispatch(
            setSpotifyRefreshTokenMain(result.data.body['refresh_token'])
          );
          dispatch(setSpotifyExpiryDate(result.data.body['spotifyExpiryDate']));
          activeTrackListener(result.data.body['access_token']);
        }
      })
      .catch((e) => {
        sendSpotifyError(e);
      });
  };

  const connectSpotifyWindowRedirectHandler = (event, url) => {
    if (!url) return;

    let code;

    if (url.includes('localhost:')) {
      code = url.substring(url.indexOf('=') + 1);
      authorizeSpotify(code);
    }
  };

  const loadConnectSpotifyContent = () => {
    console.warn('loading spotify');
    try {
      DAO.createSpotifyURL(currentUser.accessToken)
        .then(async (res) => {
          if (res?.data?.success) {
            console.warn(
              'spotify authorize url from server ',
              res.data.authorizeURL
            );

            connectSpotifyWindow.once('ready-to-show', () => {
              connectSpotifyWindow.setTitle('Connect with Spotify');
              connectSpotifyWindow.show();
            });

            connectSpotifyWindow
              .loadURL(res.data.authorizeURL)
              .then()
              .catch((e) => sendSpotifyError(e));
          }
        })
        .catch((e) => {
          sendSpotifyError(e);
        });
    } catch (e) {
      sendSpotifyError(e);
    } finally {
      console.log('hiding window');
      hideWindow(connectSpotifyWindow);
    }
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
