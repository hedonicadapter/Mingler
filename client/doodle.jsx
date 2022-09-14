ipcMain.on('settingsblurred:fromrenderer', () => {
  //     if (store?.getState()?.app?.appVisible){
  // mainWindow?.blur()
  //     }
  // toggleWidget();
  mainWindow?.setAlwaysOnTop(true);
  mainWindow?.setAlwaysOnTop(false);
  // mainWindow?.setFocusable(false);
  // hideWindow();
});

ipcMain.on('settingsfocused:fromrenderer', () => {
  mainWindow?.showInactive();

  clearTimeout(showWindowTimeout);
  showWindowTimeout = setTimeout(() => mainWindow?.setOpacity(1), 150);

  store?.dispatch({
    type: 'appVisibleTrue',
    payload: {},
  });
});

mainWindow.on('blur', () => {
  mainWindow?.setAlwaysOnTop(true);
  mainWindow?.showInactive();
  if (mainWindow.webContents.isDevToolsFocused()) {
    return; //ignore
  } else {
    store?.dispatch({
      type: 'appVisibleFalse',
      payload: {},
    });

    ipcMain.once('animationComplete', () => {
      console.log('animation complete');
      hideWindow();
    });
  }
});
