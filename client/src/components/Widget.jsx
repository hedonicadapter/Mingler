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
import { BrowserWindowProvider } from '../contexts/BrowserWindowContext';
import { makeClickthrough } from '../config/clickthrough';
import { ipcRenderer } from 'electron';
import { css } from '@stitches/react';

const Border = () => {
  return <div style={{ float: 'left', minWidth: 8 }}>&nbsp;</div>;
};

const Pane = ({ children }) => {
  const appState = useSelector(getApp);
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(true);

  // makeClickthrough();

  return (
    <motion.div
      // onContextMenu={(e) => e.preventDefault()}
      transition={{ duration: 0.15 }}
      animate={appState?.appVisible ? 'show' : 'hide'}
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

const blurHandler = () => {
  ipcRenderer.send('blur');
};

export default function Widget() {
  useEffect(() => {
    window.addEventListener('blur', blurHandler);

    return () => window.removeEventListener('blur', blurHandler);
  }, []);
  return (
    <AuthProvider>
      <ClientSocketProvider>
        <FriendsProvider>
          <UserStatusProvider>
            <BrowserWindowProvider>
              <Memoized>
                <Border />
                <MenuButton />

                <FriendsList />
              </Memoized>
            </BrowserWindowProvider>
          </UserStatusProvider>
        </FriendsProvider>
      </ClientSocketProvider>
    </AuthProvider>
  );
}
