import React, { useState } from 'react';
import { css, styled } from '@stitches/react';

import * as electron from 'electron';

import './Widget.css';

import colors from '../config/colors';
import FriendsList from './FriendsList';
import SettingsPane from './SettingsPane';
import WidgetFooter from './WidgetFooter';
import WelcomePane from './WelcomePane';
import { AuthProvider } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const ipc = electron.ipcRenderer;
ipc.setMaxListeners(2);

const MainPane = styled('div', {
  // marginTop: -10,
  // float: 'right',
  // overflow: 'hidden',
  transition: 'transform 300ms ease, opacity 150ms ease-in',
  // width: window.innerWidth / 4,
  willChange: 'transform',

  variants: {
    visible: {
      true: {
        pointerEvents: 'auto',
        transform: 'translateX(0%)',
        opacity: 1,
      },
      false: {
        pointerEvents: 'none',
        transform: 'translateX(100%)',
        opacity: 0,
      },
    },
  },
});

export default function Widget() {
  // clickthrough everything except className='clickable' (pointer-events: 'auto')
  // const setIgnoreMouseEvents =
  //   require('electron').remote.getCurrentWindow().setIgnoreMouseEvents;
  // addEventListener('pointerover', function mousePolicy(event) {
  //   mousePolicy._canClick =
  //     event.target === document.documentElement
  //       ? mousePolicy._canClick && setIgnoreMouseEvents(true, { forward: true })
  //       : mousePolicy._canClick || setIgnoreMouseEvents(false) || 1;
  // });
  // setIgnoreMouseEvents(true, { forward: true });

  const [visible, setVisible] = useState(true);

  const toggleMainPane = () => {
    setVisible(!visible);
  };

  ipc.removeAllListeners();

  ipc.on('globalShortcut', (evt, args) => {
    toggleMainPane();
  });
  ipc.on('hideWidget', (evt, args) => {
    setVisible(false);
  });

  return (
    <MainPane visible={true}>
      <AuthProvider>
        {/* <motion.div
          initial={{
            x: '120%',
            opacity: 0,
          }}
          animate={{
            x: '0%',
            opacity: 1,
          }}
          transition={{ duration: 0.5 }}
        > */}
        <FriendsList />
        <WidgetFooter />
        {/* </motion.div> */}
      </AuthProvider>
    </MainPane>
  );
}
