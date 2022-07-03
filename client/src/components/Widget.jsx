import React, { useEffect, useState } from 'react';

import styles from './Widget.module.css';

import colors from '../config/colors';
import FriendsList from './FriendsList';
import { AuthProvider } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import MenuButton from './MenuButton';
import { ClientSocketProvider } from '../contexts/ClientSocketContext';
import { FriendsProvider } from '../contexts/FriendsContext';
import { UserStatusProvider } from '../contexts/UserStatusContext';
import { useSelector } from 'react-redux';
import {
  appVisibleTrue,
  getApp,
  toggleAppVisible,
} from '../mainState/features/appSlice';
import { BrowserWindowProvider } from '../contexts/BrowserWindowContext';
import { makeClickthrough } from '../config/clickthrough';
import { ipcRenderer } from 'electron';

const Border = () => {
  return <div style={{ float: 'left', minWidth: 8 }}>&nbsp;</div>;
};

const Pane = ({ children }) => {
  const appState = useSelector(getApp);
  const [visible, setVisible] = useState(true);

  return (
    <motion.div
      // onContextMenu={(e) => e.preventDefault()}
      initial={'hide'}
      exit={'hide'}
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
      onAnimationComplete={() => ipcRenderer.send('animationComplete')}
    >
      {children}
    </motion.div>
  );
};
const Memoized = React.memo(Pane);

export default function Widget() {
  const appState = useSelector(getApp);

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
