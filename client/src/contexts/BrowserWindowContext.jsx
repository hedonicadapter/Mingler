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
    spellcheck: false,
    devTools: false,
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
    spellcheck: false,
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

  // const [settingsWindow, setSettingsWindow] = useState(null);
  // const [findFriendsWindow, setFindFriendsWindow] = useState(null);
  // const [connectSpotifyWindow, setConnectSpotifyWindow] = useState(null);

  // useEffect(() => {
  //   let settingsWindowStateless = new BrowserWindow(settingsWindowConfig);
  //   let findFriendsWindowStateless = new BrowserWindow(findFriendsWindowConfig);
  //   let connectSpotifyWindowStateless = new BrowserWindow(
  //     connectSpotifyWindowConfig
  //   );

  //   setSettingsWindow(settingsWindowStateless);
  //   setFindFriendsWindow(findFriendsWindowStateless);
  //   setConnectSpotifyWindow(connectSpotifyWindowStateless);

  //   return () => {
  //     settingsWindowStateless = null;
  //     findFriendsWindowStateless = null;
  //     connectSpotifyWindowStateless = null;

  //     setSettingsWindow(null);
  //     setFindFriendsWindow(null);
  //     setConnectSpotifyWindow(null);
  //   };
  // }, []);

  const settingsWindowFocusHandler = () => {
    console.log('sending from renterer');
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
    if (!window || window.isDestroyed()) return;

    window.setSkipTaskbar(true);
    if (process.platform == 'win32') window.minimize();
    else if (process.platform == 'darwin') app?.hide();
    else window.hide();
  };

  const settingsWindowCloseHandler = (evt) => {
    hideWindow(settingsWindow);
  };

  const findFriendsWindowCloseHandler = () => {
    hideWindow(findFriendsWindow);
  };

  const connectSpotifyWindowCloseHandler = () => {
    hideWindow(connectSpotifyWindow);
    // setConnectSpotifyWindow(null);
  };

  const toggleConnectSpotifyHandler = () => {
    toggleConnectSpotify();
  };
  const disconnectSpotifyHandler = () => {
    DAO.disconnectSpotify(currentUser?._id, currentUser?.accessToken)
      .then((result) => {
        if (result?.data?.success) {
          dispatch(setSpotifyAccessTokenMain('disconnect'));
          dispatch(setSpotifyRefreshTokenMain(null));
          dispatch(setSpotifyExpiryDate(null));
          activeTrackListener('disconnect');
        }
      })
      .catch((e) => {
        sendSpotifyError(e);
      });
  };

  const traySettingsHandler = () => {
    toggleSettings();
  };

  useEffect(() => {
    // Clusterfuck of close handling to keep unclosability working
    ipcRenderer.once('exit:frommain', () => {
      // if (settingsWindow && !settingsWindow?.isDestroyed()) {
      // settingsWindow.removeListener('close', settingsWindowCloseHandler);
      // settingsWindow?.destroy();
      // dispatch(settingsOpenFalse());
      // settingsWindowStateless = null;
      setSettingsWindow(null);
      // }
      // if (findFriendsWindow && !findFriendsWindow?.isDestroyed()) {
      // findFriendsWindow.removeListener(
      //   'close',
      //   findFriendsWindowCloseHandler
      // );
      // findFriendsWindow?.destroy();
      // dispatch(findFriendsOpenFalse());
      // findFriendsWindowStateless = null;
      setFindFriendsWindow(null);
      // }
      // if (connectSpotifyWindow && !connectSpotifyWindow?.isDestroyed()) {
      //   // connectSpotifyWindow?.close();
      // connectSpotifyWindow?.destroy();
      // connectSpotifyWindowStateless = null;
      setConnectSpotifyWindow(null);
      // }

      setReadyToExit(true);
    });
    // return () => {
    //   hideWindow(settingsWindow);
    //   hideWindow(findFriendsWindow);
    //   hideWindow(connectSpotifyWindow);
    // };
  }, []);

  useEffect(() => {
    console.log('separator');
    console.log(!settingsWindow);
    console.log(!findFriendsWindow);
    console.log(!connectSpotifyWindow);
    console.log(readyToExit);
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
      settingsWindow &&
        !settingsWindow?.isDestroyed() &&
        settingsWindow.destroy();
    };
  }, [settingsWindow]);

  useEffect(() => {
    if (!findFriendsWindow || findFriendsWindow.isDestroyed()) return;

    loadFindFriendsContent();

    findFriendsWindow.on('close', findFriendsWindowCloseHandler);
    // findFriendsWindow.on('closed', findFriendsWindowClosedHandler);

    return () => {
      findFriendsWindow.removeListener('close', findFriendsWindowCloseHandler);
      // findFriendsWindow.removeListener(
      //   'closed',
      //   findFriendsWindowClosedHandler
      // );
      findFriendsWindow &&
        !findFriendsWindow?.isDestroyed() &&
        findFriendsWindow.destroy();
    };
  }, [findFriendsWindow]);

  useEffect(() => {
    if (!connectSpotifyWindow) return;
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
    if (!findFriendsWindow || findFriendsWindow.isDestroyed()) return;

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
    if (settingsWindow?.isDestroyed()) return;
    settingsWindow
      .loadURL(`file://${app.getAppPath()}/index.html#/settings`)
      .then()
      .catch(console.warn);

    settingsWindow.once('ready-to-show', () => {
      settingsWindow.setTitle('Settings');
    });
  };

  const toggleSettings = (page = 'Widget', quickSetting = false) => {
    if (!settingsWindow || settingsWindow.isDestroyed()) return;

    dispatch(setSettingsContentMain(page));

    settingsWindow.setSkipTaskbar(false);

    if (!appState.settingsOpen) {
      settingsWindow.show();
      dispatch(settingsOpenTrue());
    } else if (appState.settingsOpen && !settingsWindow.isVisible()) {
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
          hideWindow(connectSpotifyWindow);
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

            if (connectSpotifyWindow?.isDestroyed()) return;
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
