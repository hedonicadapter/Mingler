import React, { useState, useEffect } from 'react';
import { css } from '@stitches/react';
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion';

import colors from '../config/colors';
import Marky from './Marky';
import { ChatBox } from './ChatBox';
import { useLocalStorage } from '../helpers/localStorageManager';
import DAO from '../config/DAO';

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

export default function CardBody({
  activity,
  userID,
  expanded,
  chatVisible,
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
