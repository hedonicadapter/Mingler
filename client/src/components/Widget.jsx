import React, { useState } from 'react';
import * as electron from 'electron';

import './Widget.css';

import colors from '../config/colors';
import FriendsList from './FriendsList';
import SettingsPane from './SettingsPane';
import WidgetFooter from './WidgetFooter';
import { AuthProvider } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import MenuButton from './MenuButton';
import { ClientSocketProvider } from '../contexts/ClientSocketContext';
import { FriendsProvider } from '../contexts/FriendsContext';

const ipc = electron.ipcRenderer;
ipc.setMaxListeners(2);

const Memoized = React.memo(({ children }) => {
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
    <motion.div
      animate={visible ? 'show' : 'hide'}
      variants={{
        show: {
          pointerEvents: 'auto',
          transform: 'translateX(0%)',
          opacity: 1,
        },
        hide: {
          pointerEvents: 'none',
          transform: 'translateX(100%)',
          opacity: 0,
        },
      }}
    >
      {children}
    </motion.div>
  );
});

export default function Widget() {
  // clickthrough everything except className='clickable' (pointer-events: 'auto')
  const setIgnoreMouseEvents =
    require('electron').remote.getCurrentWindow().setIgnoreMouseEvents;
  addEventListener('pointerover', function mousePolicy(event) {
    mousePolicy._canClick =
      event.target === document.documentElement
        ? mousePolicy._canClick && setIgnoreMouseEvents(true, { forward: true })
        : mousePolicy._canClick || setIgnoreMouseEvents(false) || 1;
  });
  setIgnoreMouseEvents(true, { forward: true });

  return (
    <Memoized>
      <AuthProvider>
        <ClientSocketProvider>
          <FriendsProvider>
            <MenuButton />
            <FriendsList />
            <WidgetFooter />
          </FriendsProvider>
        </ClientSocketProvider>
      </AuthProvider>
    </Memoized>
  );
}
