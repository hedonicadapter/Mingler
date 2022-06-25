import React, { useEffect, useRef, useState } from 'react';
import { css } from '@stitches/react';

import colors from '../config/colors';
import { useDispatch, useSelector } from 'react-redux';
import {
  appVisibleFalse,
  getApp,
  settingsFocusedFalse,
  settingsFocusedTrue,
  settingsOpenFalse,
  settingsOpenTrue,
} from '../mainState/features/appSlice';
import { AnimatePresence, motion } from 'framer-motion';
import { useBrowserWindow } from '../contexts/BrowserWindowContext';

const container = css({
  fontSize: '0.9em',
  backgroundColor: 'transparent',
  // flex: 1,
  // height: '100%',
  // marginTop: 'auto',

  backgroundColor: colors.offWhite,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
});
const searchInputStyle = css({
  fontSize: '0.9em',
  letterSpacing: '1px',

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
  marginBottom: 18,
});
const button = css({
  fontSize: '0.9em',
  letterSpacing: '1px',
  cursor: 'pointer',
  backgroundColor: 'transparent',
  color: colors.darkmodeBlack,
  // margin: 15,
  // marginLeft: 20,
  // marginRight: 20,
  // padding: 10,
});

export default function WidgetFooter({
  handleSearchInput,
  searchValue,
  friends,
}) {
  const dispatch = useDispatch();

  const appState = useSelector(getApp);
  const { toggleFindFriends, toggleSettings } = useBrowserWindow();

  const searchInputRef = useRef();

  useEffect(() => {
    if (friends <= 0) searchInputRef?.current?.focus();
  }, [searchInputRef]);

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
        onClick={searchValue ? toggleFindFriends : () => toggleSettings()}
        className={button()}
      >
        <AnimatePresence>
          {searchValue && (
            <motion.div
              style={{ position: 'absolute', right: 20, bottom: 18 }}
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
              style={{ position: 'absolute', bottom: 20, right: 18 }}
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
    </footer>
  );
}
