import React, { useEffect, useRef, useState } from 'react';
import { css } from '@stitches/react';

import colors from '../config/colors';
import { useDispatch } from 'react-redux';
import {
  appVisibleFalse,
  settingsFocusedFalse,
  settingsFocusedTrue,
  settingsOpenFalse,
  settingsOpenTrue,
} from '../mainState/features/appSlice';
import { AnimatePresence, motion } from 'framer-motion';

const electron = require('electron');
const app = electron.remote.app;
const BrowserWindow = electron.remote.BrowserWindow;

const container = css({
  fontSize: '1.0em',
  backgroundColor: 'transparent',
  flex: 1,
  height: '100%',
  marginTop: 'auto',
  flex: '0 1 40px',
  backgroundColor: colors.offWhite,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
});
const searchInputStyle = css({
  fontSize: '1.0em',

  transition: 'opacity 0.15s ease',
  '&::placeholder': {
    opacity: 0.7,
  },
  '&:hover': {
    '&::placeholder': {
      opacity: 1,
    },
  },
  '&:focus': {
    '&::placeholder': {
      opacity: 1,
    },
  },

  // width: '100%',
  margin: 15,
  marginLeft: 20,
  marginRight: 20,
  marginBottom: 20,
});
const button = css({
  cursor: 'pointer',
  backgroundColor: 'transparent',
  color: colors.darkmodeBlack,
  // margin: 15,
  // marginLeft: 20,
  // marginRight: 20,
  // padding: 10,
});

const settingsWindowConfig = {
  title: 'Settings',
  show: false,
  frame: false,
  transparent: true,
  width: 560,
  webPreferences: {
    nodeIntegration: true,
    enableRemoteModule: true,
  },
};

export default function WidgetFooter({
  handleSearchInput,
  toggleFindFriends,
  searchValue,
  friends,
}) {
  const dispatch = useDispatch();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsWindow, setSettingsWindow] = useState(
    new BrowserWindow(settingsWindowConfig)
  );

  const searchInputRef = useRef();

  useEffect(() => {
    settingsWindow?.removeAllListeners();

    settingsWindow?.on('focus', () => {
      dispatch(settingsFocusedTrue());
    });

    settingsWindow?.on('blur', () => {
      dispatch(settingsFocusedFalse());
      if (!electron.remote.getCurrentWindow().isFocused()) {
        dispatch(appVisibleFalse());
      }
    });
  }, [settingsWindow]);

  useEffect(() => {
    if (friends <= 0) searchInputRef?.current?.focus();
  }, [searchInputRef]);

  const toggleSettings = () => {
    if (!settingsOpen) {
      settingsWindow.on('close', function () {
        setSettingsWindow(null);
        dispatch(settingsOpenFalse());
      });
      settingsWindow.on('closed', function () {
        setSettingsWindow(new BrowserWindow(settingsWindowConfig));
        setSettingsOpen(false);
        dispatch(settingsOpenFalse());
      });
      settingsWindow.loadURL(`file://${app.getAppPath()}/index.html#/settings`);

      settingsWindow.once('ready-to-show', () => {
        settingsWindow.setTitle('Settings');
        // settingsWindow.webContents.send('focus', searchValue);

        settingsWindow.show();
        setSettingsOpen(true);
        dispatch(settingsOpenTrue());
      });
    } else settingsWindow.focus();
  };

  return (
    <footer className={container()}>
      <input
        placeholder="search... "
        type="text"
        value={searchValue || ''}
        onChange={handleSearchInput}
        className={searchInputStyle()}
        ref={searchInputRef}
        onKeyUp={(evt) => {
          if (evt.key === 'Enter') {
            toggleFindFriends();
          }
        }}
        onBlur={() => {
          if (friends.length <= 0) {
            searchInputRef?.current?.focus();
          } else if (searchValue) {
            searchInputRef?.current?.focus();
          }
        }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        exit={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        onClick={searchValue ? toggleFindFriends : toggleSettings}
        className={button()}
      >
        {/* <AnimatePresence>
          {searchValue ? (
            <motion.div>find '{searchValue}'</motion.div>
          ) : (
            <>settings ⚙</>
          )}
        </AnimatePresence> */}
        <AnimatePresence>
          {searchValue && (
            <motion.div
              style={{ position: 'absolute', right: 20, bottom: 15 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              find '{searchValue}'
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {!searchValue && (
            <motion.div
              style={{ position: 'absolute', bottom: 15, right: 20 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              settings ⚙
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {/* // : (
        //   <div className={button()} onClick={handleSettingsButton}>
        //     settings ⚙
        //   </div>
        // ) */}
    </footer>
  );
}
