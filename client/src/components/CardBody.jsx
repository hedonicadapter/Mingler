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
  conversations,
  setFriends,
}) {
  return (
    <div style={{ backgroundColor: colors.offWhiteHovered, minHeight: '30px' }}>
      <motion.div
        animate={{ opacity: 1, y: '20%' }}
        initial={{ opacity: 0, y: '0%' }}
        exit={{ opacity: 0, y: '-20%' }}
        transition={{ duration: 0.15 }}
      >
        {activity?.map((activity, index) => (
          <div className={markyContainer()}>
            <Marky
              {...activity}
              userID={userID}
              marKey={index}
              expanded={expanded}
            />
          </div>
        ))}
        <AnimatePresence>
          {chatVisible && (
            <motion.div
              initial={{ opacity: 0, y: -800 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -800 }}
              transition={{ duration: 0.15 }}
            >
              <ChatBox receiver={userID} conversations={conversations} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
