import React, { useEffect, useState } from 'react';

import './Widget.css';

import colors from '../config/colors';
import FriendsList from './FriendsList';
import { AuthProvider } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import MenuButton from './MenuButton';
import { ClientSocketProvider } from '../contexts/ClientSocketContext';
import { FriendsProvider } from '../contexts/FriendsContext';
import { UserStatusProvider } from '../contexts/UserStatusContext';
import { useDispatch, useSelector } from 'react-redux';
import {
  appVisibleTrue,
  getApp,
  toggleAppVisible,
} from '../mainState/features/appSlice';

const Pane = ({ children }) => {
  const appState = useSelector(getApp);
  const dispatch = useDispatch();

  // If settings window is open and focused, toggle the main app
  useEffect(() => {
    if (appState.app.settingsOpen && appState.app.settingsFocused) {
      dispatch(appVisibleTrue());
    }
  }, [appState]);

  return (
    <motion.div
      // style={{ height: '100%' }}
      onContextMenu={(e) => e.preventDefault()}
      animate={appState?.app?.appVisible ? 'show' : 'hide'}
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

const Memoized = React.memo(Pane);

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
            </Memoized>
          </UserStatusProvider>
        </FriendsProvider>
      </ClientSocketProvider>
    </AuthProvider>
  );
}
