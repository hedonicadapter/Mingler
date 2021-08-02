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
// import mainWindowCreator from '../mainWindow.js';

import dao from './config/dao';

var Positioner = require('electron-positioner');
const Store = require('electron-store');

Store.initRenderer();

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

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
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
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
    resizable: false,
    width: width / 4,
    height: height,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      devTools: false,
    },
  });

  mainWindow.setAlwaysOnTop(true, 'status');
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
      mainWindow.focus();
    }
  });

  //go offline on close
  ipcMain.on('currentUserID', (evt, data) => {
    mainWindow.on('close', async function (e) {
      e.preventDefault();

      server?.close(() => {
        dao.logOut().then(() => {
          mainWindow.destroy();
          return;
        });
      });

      // const usersRef = db.collection('Users');

      // Delete current user from their friends' OnlineFriend collections
      // usersRef
      //   .doc(data)
      //   .get()
      //   .then((doc) => {
      //     doc.data().Friends.forEach((friend) => {
      //       usersRef
      //         .doc(friend)
      //         .collection('OnlineFriends')
      //         .doc(data)
      //         .delete()
      //         .then(() => {
      //           mainWindow.destroy();
      //         })
      //         .catch((error) => {
      //           console.error('Error removing document: ', error);
      //         });
      //     });
      //   });
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

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
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

ipcMain.on('sendUserIDToChromiumExtension', (evt, data) => {
  sendUserIDToChromiumExtension(data);
});

var http = require('http');
let server;

const sendUserIDToChromiumExtension = (userID) => {
  server?.close();
  const PORT = process.env.PORT || 8080;

  try {
    server = http
      .createServer(function (request, response) {
        response.writeHeader(200, {
          'Cache-Control': 'no-cache',
          'Content-Type': 'text/html',
        });
        response.write(userID, () => {
          console.log('Writing string Data...');
        });
        response.end();
      })
      .listen(PORT);
  } catch (exception) {
    console.log('Creating server exception: ', exception);
  }
};

let showing = false;

const toggleWidget = () => {
  if (showing) {
    mainWindow?.webContents.send('globalShortcut');
    mainWindow?.focus();

    showing = !showing;
  } else if (!showing) {
    mainWindow?.blur(); //activates onblur event further down
  }
};
const hideWidget = () => {
  mainWindow?.webContents.send('hideWidget');
  showing = !showing;
};

app.whenReady().then(() => {
  createWindow();

  const shortcut = globalShortcut.register('CommandOrControl+q', () => {
    toggleWidget();
  });
  if (!shortcut) {
    console.log('registration failed');
  }
  console.log(globalShortcut.isRegistered('CommandOrControl+q'));
});

app.on('browser-window-blur', (evt, win) => {
  if (win.webContents.isDevToolsFocused()) {
    return; //ignore
  } else {
    hideWidget();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});
