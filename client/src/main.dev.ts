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

var Positioner = require('electron-positioner');

global.state = {};

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

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

// const createFindFriendsWindow = async () => {
//   findFriendsWindow = new BrowserWindow({
//     show: false,
//     // frame: false,
//     // transparent: true,
//     width: 560,
//     webPreferences: {
//       nodeIntegration: true,
//       enableRemoteModule: true,
//     },
//   });

//   findFriendsWindow.loadURL(`file://${__dirname}/index.html#findfriends`);

//   findFriendsWindow.webContents.on('ready-to-show', () => {
//     console.log('READY TO SHOW');
//     if (!findFriendsWindow) {
//       throw new Error('"findFriendsWindow" is not defined');
//     }
//     findFriendsWindow.show();
//     findFriendsWindow.focus();

//     ipcMain.on('findFriendsWindow:toggle', () => {
//       console.log('YOOOOOO');
//       if (findFriendsWindow?.isVisible()) {
//         console.log('ISVISIBLE');
//         findFriendsWindow.show();
//         findFriendsWindow.focus();
//       } else {
//         console.log('ISINVISIBLE');
//         findFriendsWindow.hide();
//         findFriendsWindow.blur();
//       }
//     });
//   });

//   findFriendsWindow.webContents.once('dom-ready', () => {});
// };

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
    // resizable: false,
    // width: width / 4,
    height: height,
    minWidth: 360,
    // x: 0,
    // y: height,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      devTools: true,
    },
  });

  mainWindow.on('will-resize', async function (e, details) {
    if (details.y != 0) {
      e.preventDefault();
    }
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

  mainWindow.webContents.once('dom-ready', () => {
    try {
      ipcMain.on('currentUser:signedIn', (event, userID) => {
        const httpServer = createServer();
        const io = new Server(httpServer, {
          // path: '/auth',
          pingInterval: 10000,
          pingTimeout: 5000,
          cookie: false,
        });

        const authIo = io.of('/auth');

        authIo.on('connection', (socket) => {
          ipcMain.once('currentUser:signedOut', () => {
            socket.disconnect();
            httpServer.close();
            console.log('Socket closed');
          });

          authIo.emit('fromAppToHost:userID', userID);

          socket.on('fromHostToApp:data', (data) => {
            console.log('from host: ', data);

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

  ipcMain.on('refreshtoken:fromrenderer', (e, tokens) => {
    mainWindow?.webContents.send('refreshtoken:frommain', tokens);
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
  installExtension([REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS], {
    loadExtensionOptions: {
      allowFileAccess: true,
    },
  })
    .then((name) => {
      console.log(`Added Extension:  ${name}`);
      try {
        const store = configureStore(null, global.state, 'main');

        store.subscribe(() => {
          global.state = store.getState();
          // console.log('STAAAATE ', store.getState());

          // persist store changes
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
