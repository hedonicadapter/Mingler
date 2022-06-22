import React, { useState } from 'react';
import { css } from '@stitches/react';
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion';
import ReactPlayer from 'react-player';
import { RiArrowDropUpLine } from 'react-icons/ri';

import colors from '../config/colors';
import { ChatBox } from './ChatBox';
import { useLocalStorage } from '../helpers/localStorageManager';

const electron = require('electron');
const BrowserWindow = electron.remote.BrowserWindow;
const app = electron.remote.app;

const markyContainer = css({
  padding: 6,
});

const connectChatClientPopUpConfig = {
  show: false,
  frame: true,
  transparent: true,
  resizable: true,
  width: 480,
  webPreferences: {
    nodeIntegration: true,
    enableRemoteModule: true,
  },
};

const playerContainer = css({
  position: 'relative',

  paddingTop: '56.25%', // As said to do by react-player readme
});

const closePlayerButton = css({
  width: 22,
  height: 22,
  color: colors.darkmodeLightBlack,
  marginLeft: 'auto',
  cursor: 'pointer',
});

export default function CardBody({
  activity,
  userID,
  expanded,
  chatVisible,
  playerURL,
  playerVisible,
  closePlayer,
  setFriends,
}) {
  return (
    <div
      style={{
        backgroundColor: colors.offWhiteHovered,

        // padding: 10,
      }}
    >
      <AnimatePresence>
        {playerVisible && playerURL && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              padding: 10,
              paddingTop: 2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <RiArrowDropUpLine
              className={closePlayerButton()}
              onClick={() => closePlayer()}
            />
            <div className={playerContainer()}>
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
      <AnimatePresence>
        {chatVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <ChatBox receiver={userID} expanded={expanded} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
