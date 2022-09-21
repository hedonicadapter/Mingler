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

const welcomeModalConfig = {
  title: 'Welcome to Mingler',
  show: false,
  frame: false,
  transparent: true,
  width: 330,
  height: 140,
  icon: favicon,
  resizable: false,
  closable: false,
  alwaysOnTop: true,
  webPreferences: {
    contextIsolation: false,
    nodeIntegration: true,
    enableRemoteModule: true,
    spellcheck: false,
    devTools: false,
  },
};

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

  const [welcomeModal, setWelcomeModal] = useState(null);
  const [settingsWindow, setSettingsWindow] = useState(null);
  const [findFriendsWindow, setFindFriendsWindow] = useState(null);
  const [connectSpotifyWindow, setConnectSpotifyWindow] = useState(null);

  useEffect(() => {
    let welcomeModalStateless = new BrowserWindow(welcomeModalConfig);
    let settingsWindowStateless = new BrowserWindow(settingsWindowConfig);
    let findFriendsWindowStateless = new BrowserWindow(findFriendsWindowConfig);
    let connectSpotifyWindowStateless = new BrowserWindow(
      connectSpotifyWindowConfig
    );
    setWelcomeModal(welcomeModalStateless);
    setSettingsWindow(settingsWindowStateless);
    setFindFriendsWindow(findFriendsWindowStateless);
    setConnectSpotifyWindow(connectSpotifyWindowStateless);

    return () => {
      welcomeModalStateless = null;
      settingsWindowStateless = null;
      findFriendsWindowStateless = null;
      connectSpotifyWindowStateless = null;
      setWelcomeModal(null);
      setSettingsWindow(null);
      setFindFriendsWindow(null);
      setConnectSpotifyWindow(null);
    };
  }, []);

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
    window?.setSkipTaskbar(true);
    if (process.platform == 'win32') window?.minimize();
    else if (process.platform == 'darwin') app?.hide();
    else window?.hide();
  };

  const welcomeModalCloseHandler = () => {
    hideWindow(welcomeModal);
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
    dispatch(setSpotifyAccessTokenMain('disconnect'));
    dispatch(setSpotifyRefreshTokenMain(null));
    dispatch(setSpotifyExpiryDate(null));
    activeTrackListener('disconnect');
  };

  const traySettingsHandler = () => {
    toggleSettings();
  };

  useEffect(() => {
    if (!welcomeModal || welcomeModal.isDestroyed()) return;
    if (!settingsState?.showWelcome) return;
    if (welcomeModal?.isVisible()) return;

    loadWelcomeModal();

    welcomeModal.on('close', welcomeModalCloseHandler);

    return () => {
      welcomeModal.removeListener('close', welcomeModalCloseHandler);
      welcomeModal?.destroy();
    };
  }, [settingsState?.showWelcome, welcomeModal]);

  useEffect(() => {
    // Clusterfuck of close handling to keep unclosability working
    ipcRenderer.once('exit:frommain', () => {
      // if (welcomeModal && !welcomeModal?.isDestroyed()) {
      //   // welcomeModal.removeListener('close', welcomeModalCloseHandler);
      // }
      // welcomeModal?.destroy();
      // welcomeModalStateless = null;
      setWelcomeModal(null);
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
    //   hideWindow(welcomeModal);
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
    console.log(!welcomeModal);
    console.log(readyToExit);
    if (
      !welcomeModal &&
      !settingsWindow &&
      !findFriendsWindow &&
      !connectSpotifyWindow &&
      readyToExit
    ) {
      ipcRenderer.send('exitready:fromrenderer');
    }
  }, [
    settingsWindow,
    findFriendsWindow,
    connectSpotifyWindow,
    welcomeModal,
    readyToExit,
  ]);

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

  const loadWelcomeModal = () => {
    if (welcomeModal?.isDestroyed()) return;
    welcomeModal
      .loadURL(`file://${app.getAppPath()}/index.html#/welcome`)
      .then()
      .catch(console.warn);

    welcomeModal.once('ready-to-show', () => {
      welcomeModal.setTitle('Welcome to Mingler');
    });
    welcomeModal.webContents.once('did-finish-load', () => {
      welcomeModal.show();
    });
  };

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
    if (findFriendsWindow?.isDestroyed()) return;
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
