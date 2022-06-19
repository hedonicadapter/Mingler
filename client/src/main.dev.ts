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

import dao from './config/dao';
import configureStore from './mainState/newStore';

const storage = require('node-persist');
storage.init({ dir: './mainState/persist' });

var Positioner = require('electron-positioner');

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let store;
let mainWindow: BrowserWindow | null = null;
let findFriendsWindow: BrowserWindow | null = null;

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

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    frame: false,
    transparent: true,
    show: false,
    height: height,
    minWidth: 430,
    webPreferences: {
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

  // mainWindow.setAlwaysOnTop(true, 'status');
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
      if (mainWindow.webContents.isDevToolsFocused()) {
        return; //ignore
      } else {
        store?.dispatch({
          type: 'appVisibleFalse',
          payload: {},
        });
      }
    });

    mainWindow.on('focus', () => {
      if (mainWindow.webContents.isDevToolsFocused()) {
        return; //ignore
      } else {
        store?.dispatch({
          type: 'appVisibleTrue',
          payload: {},
        });
      }
    });
  });

  mainWindow.webContents.once('dom-ready', async () => {
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

      ipcMain.on('currentUser:signedIn', (event, userID) => {
        const httpServer = createServer();
        const io = new Server(httpServer, {
          // path: '/auth',
          pingInterval: 10000,
          pingTimeout: 5000,
          cookie: false,
        });

        const authIo = io.of('/auth');

        ipcMain.on('currentUser:signedOut', () => {
          // socket.disconnect();
          httpServer.close();
          console.log('Socket closed');
        });

        authIo.on('connection', (socket) => {
          authIo.emit('fromAppToHost:userID', userID);

          socket.on('fromHostToApp:data', (data) => {
            // if data = time send time not chromiumhostdata
            // Picked up by Marky which then opens a browser tab for the video with the correct time
            if (data.time) {
              mainWindow?.webContents.send(
                'chromiumHostData:YouTubeTime',
                data
              );
            } else {
              mainWindow?.webContents.send('chromiumHostData', data);
            }
          });

          ipcMain.on('getYouTubeTime', (event, packet) => {
            const { YouTubeTitle, YouTubeURL } = packet;

            socket.emit('getYouTubeTime', {
              YouTubeTitle,
              YouTubeURL,
            });
          });
        });

        authIo.on('disconnect', (reason) => {
          console.log('Host socket dc reason: ', reason);
        });

        const PORT = 8081;
        httpServer.listen(PORT);
      });
    } catch (exception) {
      console.log('Creating host socket server exception: ', exception);
    }
  });

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
    mainWindow.on('close', async function (e) {
      e.preventDefault();

      server?.close(() => {
        dao.logout().then(() => {
          mainWindow.destroy();
          return;
        });
      });
    });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
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
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const toggleWidget = () => {
  let appVisible = store?.getState()?.app?.appVisible;

  if (appVisible) {
    mainWindow?.blur();
  } else if (!appVisible) {
    mainWindow?.focus(); //activates onblur event further down
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
              showWelcome: global.state?.settings?.showWelcome,
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
