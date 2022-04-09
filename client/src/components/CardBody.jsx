import React, { useState, useRef, useEffect } from 'react';
import { css } from '@stitches/react';
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion';
import { Flipper, Flipped } from 'react-flip-toolkit';
import ReactPlayer from 'react-player/youtube';

import colors from '../config/colors';
import Marky from './Marky';
import { ChatBox } from './ChatBox';
import { useLocalStorage } from '../helpers/localStorageManager';
import DAO from '../config/DAO';

const electron = require('electron');
const BrowserWindow = electron.remote.BrowserWindow;
const app = electron.remote.app;

const flipper = css({
  height: '100%',
  backgroundColor: colors.darkmodeLightBlack,
  // marginTop: -16, // the Flipper component has some inherent top margin
  // marginLeft: -25,
  // paddingBottom: 1,
});
const markyContainer = css({
  marginLeft: -30,
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
  console.log('setFriends cardBody ', setFriends);
  return (
    <>
      <div className={flipper()}>
        <motion.ul layout>
          {activity?.map((activity, index) => (
            <motion.div layout className={markyContainer()}>
              <Marky
                {...activity}
                userID={userID}
                marKey={index}
                expanded={expanded}
              />
            </motion.div>
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
        </motion.ul>
      </div>
    </>
  );
}
