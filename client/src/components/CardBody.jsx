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
  userID,
  expanded,
  chatVisible,
  playerURL,
  reactPlayerRef,
  playerVisible,
  closePlayer,
  setFriends,
  isWidgetHeader,
}) {
  return (
    <motion.div className={styles.container}>
      <AnimatePresence>
        {playerVisible && playerURL && (
          <motion.div
            initial={'hide'}
            animate={'show'}
            exit={'hide'}
            variants={{
              show: { height: 'auto' },
              hide: { height: 0 },
            }}
            transition={{ duration: 0.15 }}
            // initial={{ opacity: 0, height: 0 }}
            // animate={{ opacity: 1, height: 'auto' }}
            // exit={{ opacity: 0, height: 0 }}
            // transition={{ duration: 0.15, ease: 'linear' }}
            style={{
              overflow: 'hidden',

              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: 10, paddingTop: 2 }}>
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

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className={styles.playerContainer}
              >
                <ReactPlayer
                  ref={reactPlayerRef}
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
              </motion.div>
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
