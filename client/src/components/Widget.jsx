import React, { useState } from 'react';
import * as electron from 'electron';

import './Widget.css';

import colors from '../config/colors';
import FriendsList from './FriendsList';
import WidgetFooter from './WidgetFooter';
import { AuthProvider } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import MenuButton from './MenuButton';
import { ClientSocketProvider } from '../contexts/ClientSocketContext';
import { FriendsProvider } from '../contexts/FriendsContext';
import { UserStatusProvider } from '../contexts/UserStatusContext';
import { connect } from 'react-redux';
import { compose } from '@reduxjs/toolkit';

const ipc = electron.ipcRenderer;
ipc.setMaxListeners(2);

const Pane = ({ children }) => {
  const [visible, setVisible] = useState(true);

  const toggleMainPane = () => {
    setVisible(!visible);
  };

  // this single line of code cost me months, I think it removes the listeners required for electron store
  // ipc.removeAllListeners();

  ipc.on('globalShortcut', (evt, args) => {
    toggleMainPane();
  });
  ipc.on('hideWidget', (evt, args) => {
    setVisible(false);
  });

  return (
    <motion.div
      onContextMenu={(e) => e.preventDefault()}
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
};

const mapStateToProps = (state, ownProps) => {};
const Memoized = React.memo(connect(mapStateToProps)(Pane));

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
    <AuthProvider>
      <ClientSocketProvider>
        <FriendsProvider>
          <UserStatusProvider>
            <Memoized>
              <MenuButton />
              <FriendsList />
              <WidgetFooter />
            </Memoized>
          </UserStatusProvider>
        </FriendsProvider>
      </ClientSocketProvider>
    </AuthProvider>
  );
}
