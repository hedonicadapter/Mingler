import React, { useContext, useState, useEffect, createContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notify } from '../components/reusables/notifications';
import colors from '../config/colors';
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
const BrowserView = electron.remote.BrowserView;
const ipcRenderer = electron.ipcRenderer;

const escapeHTMLPolicy = trustedTypes.createPolicy('forceInner', {
  createHTML: (to_escape) => to_escape,
});

let backgroundNoiseButNotJSX = escapeHTMLPolicy.createHTML(
  "<svg id='svg' xmlns='http://www.w3.org/2000/svg' style='height: 100%;width: 100%;position: fixed;top: 0px;left: 0px;right: 0px;bottom: 0px;pointer-events: none; z-index: 90;'><defs> <filter id='noise' y='0' x='0'> <feTurbulence class='basefrequency' stitchTiles='stitch' baseFrequency='.75' type='fractalNoise' /> </filter> <pattern id='pattern' class='tile1' patternUnits='userSpaceOnUse' height='100' width='100' y='0' x='0' > <rect class='bg' x='0' y='0' width='100%' height='100%' fill='transparent' /> <rect class='opacity' x='0' y='0' width='100%' height='100%' filter='url(#noise)' opacity='.32' /> </pattern> </defs> <rect style='pointer-events: none;' id='rect' x='0' y='0' width='100%' height='100%' fill='url(#pattern)' /></svg>"
);

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
  minHeight: 130,
  minWidth: 400,
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
  height: 890,
  minHeight: 130,
  width: 545,
  minWidth: 400,
  title: 'Connect to Spotify',
  show: false,
  frame: false,
  closable: false,
  transparent: true,
  skipTaskbar: false,
  icon: favicon,
  backgroundColor: colors.offWhite,
  webPreferences: {
    contextIsolation: false,
    nodeIntegration: true,
    enableRemoteModule: true,
    spellcheck: false,
    devTools: false,
  },
};

export function BrowserWindowProvider({ children }) {
  const dispatch = useDispatch();

  const { friends } = useFriends();
  const { activeTrackListener } = useStatus();

  const appState = useSelector(getApp);
  const settingsState = useSelector(getSettings);
  const currentUser = useSelector(getCurrentUser);

  const [readyToExit, setReadyToExit] = useState(false);
  const [connectSpotifyAuthorizeURL, setConnectSpotifyAuthorizeURL] =
    useState('');

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
    // e.preventDefault(); // doesn't work
    hideWindow(connectSpotifyWindow);
  };

  const toggleConnectSpotifyHandler = () => {
    toggleConnectSpotify();
  };
  const disconnectSpotifyHandler = () => {
    console.log('disconnecting');
    DAO.disconnectSpotify(currentUser?._id, currentUser?.accessToken)
      .then((result) => {
        if (result?.data?.success) {
          console.log('succeeded');
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

  const getSpotifyURL = async (accessToken) => {
    try {
      const result = await DAO.createSpotifyURL(currentUser.accessToken);

      if (result?.data?.success) {
        console.warn(
          'spotify authorize url from server ',
          result.data.authorizeURL
        );
        setConnectSpotifyAuthorizeURL(result.data.authorizeURL);
      } else {
        notify(
          'Something went wrong when generating a spotify authentication URL. '
        );
      }
    } catch (e) {
      console.log({ e });
      notify(
        'Something went wrong when generating a spotify authentication URL. ',
        e
      );
    }
  };

  const traySettingsHandler = () => {
    toggleSettings();
  };

  useEffect(() => {
    // Clusterfuck of close handling to keep unclosability working
    ipcRenderer.once('exit:frommain', () => {
      // if (connectSpotifyWindow && !connectSpotifyWindow?.isDestroyed()) {
      //   // connectSpotifyWindow?.close();
      // connectSpotifyWindow?.destroy();
      // connectSpotifyWindow = null;
      setConnectSpotifyWindow(null);
      // }
      // if (settingsWindow && !settingsWindow?.isDestroyed()) {
      // settingsWindow.removeListener('close', settingsWindowCloseHandler);
      // settingsWindow?.destroy();
      // dispatch(settingsOpenFalse());
      // settingsWindow = null;
      setSettingsWindow(null);
      // }
      // if (findFriendsWindow && !findFriendsWindow?.isDestroyed()) {
      // findFriendsWindow.removeListener(
      //   'close',
      //   findFriendsWindowCloseHandler
      // );
      // findFriendsWindow?.destroy();
      // dispatch(findFriendsOpenFalse());
      // findFriendsWindow = null;
      setFindFriendsWindow(null);
      // }

      setReadyToExit(true);
      ipcRenderer.send('exitready:fromrenderer');
    });
  }, []);

  // useEffect(() => {
  //   console.log('separator');
  //   console.log(!settingsWindow);
  //   console.log(!findFriendsWindow);
  //   console.log(!connectSpotifyWindow);
  //   console.log(readyToExit);
  //   if (
  //     !settingsWindow &&
  //     !findFriendsWindow &&
  //     !connectSpotifyWindow &&
  //     readyToExit
  //   ) {
  //     ipcRenderer.send('exitready:fromrenderer');
  //   }
  // }, [settingsWindow, findFriendsWindow, connectSpotifyWindow, readyToExit]);

  useEffect(() => {
    if (!settingsWindow) return;

    loadSettingsContent();

    settingsWindow.on('focus', settingsWindowFocusHandler);
    settingsWindow.on('blur', settingsWindowBlurHandler);

    settingsWindow.on('close', settingsWindowCloseHandler);
    // settingsWindow.on('closed', settingsWindowClosedHandler);

    return () => {
      if (!settingsWindow) return;

      settingsWindow.removeListener('focus', settingsWindowFocusHandler);
      settingsWindow.removeListener('blur', settingsWindowBlurHandler);
      settingsWindow.removeListener('close', settingsWindowCloseHandler);
      // settingsWindow.removeListener('closed', settingsWindowClosedHandler);
      !settingsWindow?.isDestroyed() && settingsWindow.destroy();
    };
  }, [settingsWindow]);

  useEffect(() => {
    if (!findFriendsWindow || findFriendsWindow.isDestroyed()) return;

    loadFindFriendsContent();

    findFriendsWindow.on('close', findFriendsWindowCloseHandler);
    // findFriendsWindow.on('closed', findFriendsWindowClosedHandler);

    return () => {
      if (!findFriendsWindow) return;

      findFriendsWindow.removeListener('close', findFriendsWindowCloseHandler);
      // findFriendsWindow.removeListener(
      //   'closed',
      //   findFriendsWindowClosedHandler
      // );
      !findFriendsWindow?.isDestroyed() && findFriendsWindow.destroy();
    };
  }, [findFriendsWindow]);

  useEffect(() => {
    if (!connectSpotifyWindow) return;

    loadConnectSpotifyContent();

    connectSpotifyWindow.on('close', connectSpotifyWindowCloseHandler);

    return () => {
      if (!connectSpotifyWindow) return;

      connectSpotifyWindow.removeListener(
        'close',
        connectSpotifyWindowCloseHandler
      );

      if (!connectSpotifyWindow?.isDestroyed()) {
        connectSpotifyWindow.setBrowserView(null);
        connectSpotifyWindow.destroy();
      }
    };
  }, [connectSpotifyWindow]);

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
    if (!settingsWindow) return notify('Something went wrong ', e);
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
        console.warn('spotiffff ', result);
        if (result?.data?.success) {
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

  const connectSpotifyWindowRedirectHandler = (url) => {
    if (!url) return;
    if (
      !url.startsWith('https://menglir.herokuapp.com/musicNumbsTheSpirit?code=')
    )
      return;

    let code;
    code = url.substring(url.indexOf('=') + 1, url.indexOf('&state=null'));
    authorizeSpotify(code);
  };

  const spotifyGoBack = (view, fallbackURL) => {
    if (!view || !view.webContents) return;
    if (view.webContents.canGoBack()) {
      view.webContents.goBack();
    } else {
      if (!fallbackURL.startsWith('https'))
        return notify('Prevented navigation to insecure URL. ');
      view.webContents
        .loadURL(fallbackURL)
        .then(() => console.log('loaded new url'))
        .catch((e) => notify('Something went wrong. ', e));
    }
  };

  const viewDidFinishLoadHandler = () => {
    let currentURL = view.webContents.getURL();
    if (currentURL) connectSpotifyWindowRedirectHandler(currentURL);

    view.webContents.insertCSS(
      `html, body, div, li { transition: all 0.15s linear; } body { border-radius:4px; } ul { padding-bottom: 0 !important; margin-bottom: 16px !important;}`
    );
    // background-color paints the whole area, hiding everything else
    // `html, body, div, li { background-color: ${colors.offWhite}; color: ${colors.darkmodeLightBlack} !important; transition: all 0.15s linear; } ul { padding-bottom: 0 !important; margin-bottom: 16px !important;}`

    view.webContents
      .executeJavaScript(
        `document.body.insertAdjacentHTML("beforeend", "${backgroundNoiseButNotJSX}");`
      )
      .catch(console.log);

    ipcRenderer.once('spotifygoback:frommain', () =>
      spotifyGoBack(view, connectSpotifyAuthorizeURL)
    );
  };

  // Because of the way I prevent windows from truly closing, clicking links that open in new windows crashes the app
  const viewNewWindowHandler = (evt, url) => {
    if (!view || !view.webContents) return;
    evt.preventDefault();
    if (!url.startsWith('https'))
      return notify('Prevented navigation to insecure URL. ');
    view.webContents.loadUrl(url);
  };

  const [view, setView] = useState(new BrowserView());
  useEffect(() => {
    if (!connectSpotifyWindow || !view || !connectSpotifyAuthorizeURL) return;
    if (!connectSpotifyAuthorizeURL.startsWith('https'))
      return notify('Prevented navigation to insecure URL. ');

    connectSpotifyWindow.setBrowserView(null);
    connectSpotifyWindow.setBrowserView(view);
    view.setBounds({ x: 0, y: 54, height: 800, width: 545 });
    view.setAutoResize({
      width: true,
      height: true,
      horizontal: true,
    });
    view.setBackgroundColor(colors.offWhite);
    view.webContents
      .loadURL(connectSpotifyAuthorizeURL)
      .catch((e) => notify('Something went wrong. ', e));

    view.webContents.on('did-finish-load', viewDidFinishLoadHandler);
    view.webContents.on('new-window', viewNewWindowHandler);

    return () => {
      if (!view) return;
      !connectSpotifyWindow?.isDestroyed() &&
        connectSpotifyWindow?.setBrowserView(null);
      view.webContents?.removeListener(
        'did-finish-load',
        viewDidFinishLoadHandler
      );
      view.webContents.removeListener('new-window', viewNewWindowHandler);
      view?.webContents?.destroy(); //TypeError: destroy is not a function
      setView(null);
    };
  }, [view, connectSpotifyWindow, connectSpotifyAuthorizeURL]);

  // const loadSpotifyOauth = (windoe, url) => {
  // if (!url || !windoe || windoe.isDestroyed())
  //   return sendSpotifyError('Failed to embed spotify.');
  // setView(new BrowserView());
  // view?.webContents
  //   .loadURL(connectSpotifyAuthorizeURL)
  //   .catch((e) => notify('Something went wrong. ', e));
  // };

  const loadConnectSpotifyContent = () => {
    if (connectSpotifyWindow?.isDestroyed()) return;
    connectSpotifyWindow
      .loadURL(`file://${app.getAppPath()}/index.html#/spotify`)
      .then()
      .catch(sendSpotifyError);

    connectSpotifyWindow.once('ready-to-show', () => {
      connectSpotifyWindow.setTitle('Connect with Spotify');
    });
  };

  const toggleConnectSpotify = () => {
    if (!connectSpotifyWindow || connectSpotifyWindow.isDestroyed()) return;

    connectSpotifyWindow?.setSkipTaskbar(false);

    if (connectSpotifyWindow.isVisible()) {
      connectSpotifyWindow.focus();
    } else {
      getSpotifyURL(currentUser?.accessToken);
      connectSpotifyWindow.show();
    }
  };

  const value = { toggleSettings, toggleFindFriends, toggleConnectSpotify };

  return (
    <BrowserWindowContext.Provider value={value}>
      {children}
    </BrowserWindowContext.Provider>
  );
}
