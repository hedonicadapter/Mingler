import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';
import { RiArrowDropUpLine } from 'react-icons/ri';

import colors from '../config/colors';
import { ChatBox } from './ChatBox';
import { useLocalStorage } from '../helpers/localStorageManager';
import styles from './CardBody.module.css';

const electron = require('electron');
const BrowserWindow = electron.remote.BrowserWindow;
const app = electron.remote.app;

export default function CardBody({
  activity,
  userID,
  expanded,
  chatVisible,
  playerURL,
  playerVisible,
  closePlayer,
  setFriends,
  isWidgetHeader,
}) {
  return (
    <motion.div layout="position" className={styles.container}>
      <AnimatePresence>
        {playerVisible && playerURL && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.15 }}
            style={{
              padding: 10,
              paddingTop: 2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <motion.div
              whileHover={{
                opacity: 0.86,
              }}
              transition={{ duration: 0.1 }}
              className={styles.closePlayerButtonContainer}
              onClick={() => closePlayer()}
            >
              <div className={styles.closePlayerButtonBar} />
              <RiArrowDropUpLine className={styles.closePlayerButton} />
            </motion.div>

            <div className={styles.playerContainer}>
              <ReactPlayer
                url={playerURL}
                playing={true}
                controls={true}
                width="100%"
                height="100%"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!isWidgetHeader && ( // have to do this bc it will render messages on top for seemingly no reason
        <ChatBox receiver={userID} chatVisible={chatVisible} />
      )}
    </motion.div>
  );
}
