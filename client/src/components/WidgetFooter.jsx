import React, { useEffect, useRef, useState } from 'react';

import styles from './WidgetFooter.module.css';
import colors from '../config/colors';
import { AnimatePresence, motion } from 'framer-motion';
import { useBrowserWindow } from '../contexts/BrowserWindowContext';
import ReactTooltip from 'react-tooltip';
import { useSelector } from 'react-redux';

export default function WidgetFooter({
  appVisible,
  handleSearchInput,
  searchValue,
  friends,
}) {
  const extensionID = useSelector((state) => state.extensionID);
  const { toggleFindFriends, toggleSettings } = useBrowserWindow();

  const searchInputRef = useRef(null);
  const settingsButtonRef = useRef(null);

  useEffect(() => {
    if (friends <= 0) searchInputRef?.current?.focus();
  }, [searchInputRef]);

  let globalTimeout;
  useEffect(() => {
    if (settingsButtonRef?.current) {
      ReactTooltip.show(settingsButtonRef.current);
      const timeout = setTimeout(
        () => ReactTooltip.hide(settingsButtonRef.current),
        1500
      );
      globalTimeout = timeout;
    }
    return () => clearTimeout(globalTimeout);
  }, [settingsButtonRef, appVisible]);

  return (
    <footer className={styles.container}>
      <input
        placeholder="search... "
        type="text"
        value={searchValue || ''}
        onChange={handleSearchInput}
        className={styles.searchInputStyle}
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
        className={styles.button}
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
              ref={settingsButtonRef}
              data-tip="Complete your set-up."
              data-for="completeYourSetup"
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
        {!extensionID && (
          <ReactTooltip
            id="completeYourSetup"
            place="left"
            type="dark"
            effect="solid"
            className={styles.toolTip}
          />
        )}
      </motion.div>
    </footer>
  );
}
