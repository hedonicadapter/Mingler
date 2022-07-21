/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  globalShortcut,
  screen,
  ipcMain,
  Tray,
  Menu,
  dialog,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { createServer } from 'http';
import { Server } from 'socket.io';
import installExtension, {
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} from 'electron-devtools-installer';

import configureStore from './mainState/newStore';
import { getPath } from './helpers/getPath';
import { setExtensionID } from '../editJSON';

const execFile = require('child_process').execFile;
const JSON5 = require('json5');

const storage = require('node-persist');
storage.init({ dir: './mainState/persist' });

var Positioner = require('electron-positioner');

// Disable windows default window animations
app.commandLine.appendSwitch('wm-window-animations-disabled');
app.commandLine.appendSwitch('enable-smooth-scrolling');

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

const httpServer = createServer();
const io = new Server(httpServer, {
  // path: '/auth',
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
});
const authIo = io.of('/auth');
const PORT = 8081;
httpServer.listen(PORT);

let store = null;
let mainWindow: BrowserWindow | null = null;
let findFriendsWindow: BrowserWindow | null = null;
let windowListenerScript = path.resolve(
  app.getPath('appData'),
  '..',
  'local',
  'MINGLER',
  'scripts',
  // TODO: should probably not be scripts/dist, ruins the point of path.resolve
  // getPath('scripts', app),
  'ActiveWindowListener.exe'
);
let trackListenerScript = path.resolve(
  app.getPath('appData'),
  '..',
  'local',
  'MINGLER',
  'scripts',
  // TODO: should probably not be scripts/dist, ruins the point of path.resolve
  // getPath('scripts', app),
  'ActiveTrackListener.exe'
);
let chromiumHostConfig = path.resolve(
  app.getAppPath(),
  '..',
  'extension',
  'nativeApps',
  // TODO: should probably not be scripts/dist, ruins the point of path.resolve
  // getPath('scripts', app),
  'mingler.json'
);
let windowProcess = null;
let trackProcess = null;
let refreshRetryLimit = 0;
let tray = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      { forceDownload, loadExtensionOptions: { allowFileAccess: true } }
    )
    .catch(console.log);
};

const initActiveWindowListenerProcess = () => {
  try {
    windowProcess?.exit();
  } catch (e) {
    console.warn(e);
  }

  windowProcess = execFile(windowListenerScript);

  windowProcess.stdout.on('data', function (data) {
    let windowInfo = data.toString().trim();

    console.log('windowInfo ', windowInfo);

    // Second comparison doesn't work for some reason
    if (
      windowInfo &&
      windowInfo !== 'Mingler' &&
      windowInfo !== 'Task Switching' &&
      windowInfo !== 'Snap Assist' &&
      windowInfo !== 'Spotify Free'
    ) {
      mainWindow?.webContents.send('windowinfo:frommain', {
        WindowTitle: windowInfo,
        Date: new Date(),
      });
    }
  });

  windowProcess.stderr.on('data', function (data) {
    console.warn('stderr activeWindowListener: ', data);
  });

  windowProcess.on('error', function (err) {
    if (err) return console.error('windowProcess error: ', err);
  });

  windowProcess.on('exit', () =>
    console.warn('windowProcess exited ', windowProcess)
  );
};

const initActiveTrackListenerProcess = (spotifyAccessToken) => {
  try {
    trackProcess?.exit();
  } catch (e) {
    console.warn(e);
  }

  if (!spotifyAccessToken) return;

  trackProcess = execFile(trackListenerScript, [spotifyAccessToken]);

  trackProcess.on('exit', () =>
    console.warn('trackprocess exited ', trackProcess)
  );

  trackProcess.stdout.on('data', function (data) {
    let processedData = data.toString().trim();
    if (processedData === '401') {
      trackProcess.stdin.end();
      trackProcess.stdout.destroy();
      trackProcess.stderr.destroy();
      try {
        trackProcess?.kill();
      } catch (e) {
        console.log(e);
      }
      return;
    }

    try {
      console.log('processedData1', processedData);
      if (processedData === 401) return;
      let trackInfo = JSON5.parse(processedData);

      console.log('trackinfo3 ', trackInfo);

      if (trackInfo) {
        mainWindow?.webContents.send('trackinfo:frommain', {
          Artists: trackInfo.artists,
          TrackTitle: trackInfo.name,
          TrackURL: trackInfo.link,
          Date: new Date(),
        });
      }
    } catch (e) {
      console.error(e);
    }
  });

  trackProcess.stderr.on('data', function (data) {
    console.warn('stderr activeTrackListener: ', data);
  });

  trackProcess.on('error', function (err) {
    if (err) return console.error('trackprocess error: ', err);
  });
};

// This socket is for local real-time communication between
// 1) main and renderer process, 2) mingler and the host, and by extension, the chromium extension
const initSocket = (userID) => {
  authIo.emit('fromAppToHost:userID', userID);
};

authIo.on('connection', (socket) => {
  ipcMain.once('currentUser:signedOut', () => {
    console.log('still signed out authio');
    // Prevents error when exiting app
    if (!mainWindow?.isDestroyed()) socket.emit('fromAppToHost:signedOut');

    ipcMain.removeAllListeners('getYouTubeTime');
    socket.removeAllListeners('fromHostToApp:data');
    // socket.disconnect();
    // httpServer.close();
    console.log('Signed out - socket channels closed. ');
  });

  console.log('authIo connected, rand: ', Math.random());

  socket.on('fromHostToApp:data', (data) => {
    console.log('data ', data);
    // if data = time send time not chromiumhostdata
    // Picked up by Marky which then opens a browser tab for the video with the correct time
    if (data.time) {
      // TODO: this sends to yourself if you've got a time request.
      // Needs to get data.fromID and do a mainWindow.webcontents.send(chromiumHostData:YouTubeTime)
      // which is picked up by clientSocketContext, which is sent to the server with the data and fromID, which sends it to fromID through socket,
      // which picks it up and runs setPlayerURL
      mainWindow?.webContents.send('chromiumHostData:YouTubeTime', data);
    } else {
      mainWindow?.webContents.send('chromiumHostData', data);
    }
  });

  ipcMain.on('getYouTubeTime', (event, packet) => {
    // Prevents error when exiting app
    if (!mainWindow?.isDestroyed()) socket.emit('getYouTubeTime', packet);
  });
});

authIo.on('disconnect', (reason) => {
  console.log('Host socket dc reason: ', reason);
});

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  } else {
    // Auto-start app
    app.setLoginItemSettings({
      openAtLogin: true,
    });
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    title: 'Mingler',
    frame: false,
    transparent: true,
    show: false,
    height: height,
    minWidth: 430,
    width: 430,
    maximizable: false,
    // alwaysOnTop: true,
    icon: getAssetPath(__dirname + '../assets/icons/icon.ico'),
    skipTaskbar: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      enableRemoteModule: true,
      devTools: true,
    },
  });

  var persistWidth;
  mainWindow.on('will-resize', async function (e, details) {
    if (details.y != 0) {
      e.preventDefault();
    }

    if (details.width) {
      clearTimeout(persistWidth);
      persistWidth = setTimeout(() => {
        store?.dispatch({
          type: 'setWindowWidth',
          payload: details.width,
        });
      }, 150);
    }
  });

  mainWindow.on('close', function () {
    windowProcess?.stdin.end();
    trackProcess?.stdin.end();

    windowProcess?.stdout.destroy();
    trackProcess?.stdout.destroy();

    windowProcess?.stderr.destroy();
    trackProcess?.stderr.destroy();

    trackProcess?.removeAllListeners();
    windowProcess?.removeAllListeners();

    io.close();

    trackProcess?.kill();
    windowProcess?.kill();

    mainWindow = null;
    app.exit(0);
  });

  // mainWindow?.on('show', () => {
  //   setTimeout(() => {
  //     mainWindow?.setOpacity(1);
  //   }, 200);
  // });

  mainWindow?.on('hide', () => {
    mainWindow?.setOpacity(0);
  });

  var positioner = new Positioner(mainWindow);
  positioner.move('rightCenter');

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }

    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }

    mainWindow.on('blur', () => {
      // mainWindow?.setAlwaysOnTop(true);
      mainWindow?.showInactive();
      if (mainWindow.webContents.isDevToolsFocused()) {
        return; //ignore
      } else {
        store?.dispatch({
          type: 'appVisibleFalse',
          payload: {},
        });

        // const listenerTimeout = setTimeout(() => fallbackBlur(), 200);

        ipcMain.once('animationComplete', () => {
          console.log('animation complete');
          hideWindow();
          // clearTimeout(listenerTimeout);
        });
        // mainWindow?.setFocusable(false);
      }
    });
  });

  const fallbackBlur = () => {
    ipcMain.removeAllListeners('animationComplete');
    if (mainWindow?.isVisible()) {
      hideWindow();
    }
  };

  const signOutDialog = {
    title: "don't go.",
    message: 'sign out?',
    buttons: ['nvm', 'bye'],
    defaultId: 1,
    cancelId: 0,
    noLink: true,
  };

  const signOutGuestDialog = {
    title: "don't go.",
    message: 'sign out?',
    detail: 'your account will be lost',
    buttons: ['nvm', 'bye'],
    defaultId: 1,
    noLink: true,
  };

  const confirmGuestSignOutDialog = {
    title: "don't go.",
    message: 'are you sure?',
    detail: 'forever',
    buttons: ['nvm', 'bye'],
    defaultId: 1,
    noLink: true,
  };

  ipcMain.handle('showdialog:fromrenderer', async (evt, guest: Boolean) => {
    const { response } = await dialog.showMessageBox(
      mainWindow,
      guest ? signOutGuestDialog : signOutDialog
    );

    if (response === 0) return false;

    if (response === 1) {
      if (!guest) return true;

      const { response } = await dialog.showMessageBox(
        mainWindow,
        confirmGuestSignOutDialog
      );

      if (response === 0) return false;
      if (response === 1) return true;
    }
    return false;
  });

  mainWindow.webContents.once('dom-ready', async () => {
    const notSignedInContextMenu = Menu.buildFromTemplate([
      {
        label: 'show',
        accelerator: 'CommandOrControl+q',
        click: showWindow,
      },
      { type: 'separator' },
      {
        label: 'exit',
        // No other windows are open, so we can just close from here
        click: () => mainWindow?.close(),
      },
    ]);

    const signedInContextMenu = Menu.buildFromTemplate([
      {
        label: 'show',
        accelerator: 'CommandOrControl+q',
        click: showWindow,
      },
      {
        label: 'settings',
        click: () => mainWindow?.webContents.send('tray:settings'),
      },
      {
        label: 'sign out',
        click: () => mainWindow?.webContents.send('tray:signout'),
      },
      { type: 'separator' },
      {
        label: 'exit',
        click: () => mainWindow?.webContents.send('exit:frommain'),
      },
    ]);

    const createTray = () => {
      console.log(
        'PATH path ',
        path.resolve(getPath('assets', app), 'icons', 'icon.ico')
      );
      tray = new Tray(
        path.resolve(getPath('assets', app), 'icons', 'icon.ico')
      );
      tray.setToolTip('Mingler');
      tray.setContextMenu(notSignedInContextMenu);
    };

    const setTrayContextMenu = (type: string) => {
      if (type === 'signedIn') tray?.setContextMenu(signedInContextMenu);
      if (type === 'signedOut') tray?.setContextMenu(notSignedInContextMenu);
    };

    createTray();

    ipcMain.once('currentUser:signedOut', () => {
      console.log('second listener');
      setTrayContextMenu('signedOut');
    });

    ipcMain.once('exitready:fromrenderer', () => {
      console.log('trying to exit');

      mainWindow.close();
    });

    try {
      await storage
        .getItem('store')
        .then((data) => {
          if (data?.app?.windowWidth) {
            mainWindow.setBounds({ width: data.app.windowWidth });
            positioner.move('rightCenter');
          }
        })
        .catch(console.error);

      ipcMain.on('exit:frommenubutton', () => {
        mainWindow.webContents.send('exit:frommain');
      });
      ipcMain.on('currentUser:signedIn', (event, userID) => {
        setTrayContextMenu('signedIn');

        console.log('signed in'); // CHECK IF THIS IS RUN MORE THAN ONCE
        initSocket(userID);
      });
    } catch (exception) {
      console.log('Creating host socket server exception: ', exception);
    }
  });

  initActiveWindowListenerProcess();
  // ipcMain.handle('initActiveWindowListener:fromrenderer', () => {
  //   return true;
  // });

  ipcMain.handle(
    'initActiveTrackListener:fromrenderer',
    (event, spotifyAccessToken) => {
      initActiveTrackListenerProcess(spotifyAccessToken);
      return true;
    }
  );

  ipcMain.on('sendfriendrequest:fromrenderer', async (event, data) => {
    mainWindow?.webContents.send('sendfriendrequest:frommain', data);
  });
  ipcMain.on('cancelfriendrequest:fromrenderer', async (event, data) => {
    mainWindow?.webContents.send('cancelfriendrequest:frommain', data);
  });

  ipcMain.on('refreshtoken:fromrenderer', (e, currentUser) => {
    mainWindow?.webContents.send('refreshtoken:frommain', currentUser);
  });

  ipcMain.on('toggleconnectspotify:fromrenderer', () => {
    mainWindow?.webContents.send('toggleconnectspotify:frommain');
  });

  //go offline on close
  ipcMain.on('currentUserID', (evt, data) => {
    // mainWindow.on('close', async function () {
    //   // TODO:
    //   // server?.close(() => {
    //   //   dao.logout().then(() => {
    //   //     mainWindow.destroy();
    //   //     return;
    //   //   });
    //   // });
    // });
  });

  ipcMain.on('settingsfocused:fromrenderer', () => {
    if (!store?.getState()?.app?.appVisible) {
      toggleWidget(true);
    }
  });
  ipcMain.on('settingsblurred:fromrenderer', () => {
    toggleWidget();
    mainWindow?.setAlwaysOnTop(false);
    hideWindow();
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  const shortcut = globalShortcut.register('CommandOrControl+q', () => {
    toggleWidget();
  });
  if (!shortcut) {
    console.error('registration failed');
  }
  // console.log(globalShortcut.isRegistered('CommandOrControl+q'));

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  console.log('all windows closed');
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    cleanExit();
    app.quit();
  }
  return;
});

const hideWindow = () => {
  mainWindow?.setOpacity(0);
  if (process.platform == 'win32') mainWindow?.minimize();
  else if (process.platform == 'darwin') app?.hide();
  else mainWindow?.hide();
  mainWindow?.blur();
};

const showWindow = (noFocus = false) => {
  if (noFocus) {
    mainWindow?.showInactive();
  } else {
    mainWindow?.show();
  }

  setTimeout(() => {
    mainWindow?.setOpacity(1);
  }, 150);

  store?.dispatch({
    type: 'appVisibleTrue',
    payload: {},
  });
};

const toggleWidget = (noFocus = false) => {
  let appVisible = store?.getState()?.app?.appVisible;
  ipcMain.removeAllListeners('animationComplete');
  // const listenerTimeout = setTimeout(
  //   () => ipcMain.removeAllListeners('animationComplete'),
  //   200
  // );

  if (appVisible) {
    store?.dispatch({
      type: 'appVisibleFalse',
      payload: {},
    });

    ipcMain.once('animationComplete', () => {
      hideWindow();
      // clearTimeout(listenerTimeout);
    });
  } else if (!appVisible) {
    showWindow(noFocus);
  }
};

app.whenReady().then(() => {
  installExtension([REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS], {
    loadExtensionOptions: {
      allowFileAccess: true,
    },
  })
    .then(async (name) => {
      console.log(`Added Extension:  ${name}`);

      try {
        store = configureStore(
          null,
          await storage.getItem('store'),
          // global.state,
          'main'
        );

        ipcMain.handle(
          'setextensionid:fromrenderer',
          async (evt, extensionID) => {
            if (!extensionID) return false;

            const body = await setExtensionID(chromiumHostConfig, extensionID);

            if (body) {
              store?.dispatch({
                type: 'setExtensionID',
                payload: extensionID,
              });

              authIo.emit('fromAppToHost:requestreset');
            }

            return body;
          }
        );

        ipcMain.handle('getTokens', async () => {
          const currentUser = store.getState()?.settings?.currentUser;

          return {
            accessToken: currentUser?.accessToken,
            refreshToken: currentUser?.refreshToken,
          };
        });

        store.subscribe(async () => {
          global.state = store.getState();

          // persist store changes
          await storage.setItem('store', {
            settings: {
              ...global.state?.settings,
              currentUser: {
                _id: global.state?.settings?.currentUser?._id,
                friends: global.state?.settings?.currentUser?.friends,
                accessToken: global.state?.settings?.currentUser?.accessToken,
                refreshToken: global.state?.settings?.currentUser?.refreshToken,
                spotifyAccessToken:
                  global.state?.settings?.currentUser?.spotifyAccessToken,
                spotifyRefreshToken:
                  global.state?.settings?.currentUser?.spotifyRefreshToken,
                spotifyExpiryDate:
                  global.state?.settings?.currentUser?.spotifyExpiryDate,
                keepMeSignedIn:
                  global.state?.settings?.currentUser?.keepMeSignedIn,
                guest: global.state?.settings?.currentUser?.guest,
              },
            },
            app: {
              ...global.state?.app,
              settingsOpen: false,
              findFriendsOpen: false,
              findFriendsSearchValue: '',
              settingsFocused: false,
              appVisible: true,
            },
          });
          // TODO: should this be blocking / wait? _.throttle?
        });
      } catch (e) {
        console.error('MAIN STORE ERROR: ', e);
      } finally {
        createWindow();
        // createFindFriendsWindow();
      }
    })
    .catch((err) => console.log('An error occurred: ', err));
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

var cleanExit = function () {
  io?.close();

  trackProcess?.kill(); // exit is cleaner but idk if required
  windowProcess?.kill();
};
process.on('SIGINT', cleanExit); // catch ctrl-c
process.on('SIGTERM', cleanExit); // catch kill
