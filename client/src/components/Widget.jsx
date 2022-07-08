import React, { useEffect, useState } from 'react';

import styles from './Widget.module.css';

import colors from '../config/colors';
import FriendsList from './FriendsList';
import { AuthProvider } from '../contexts/AuthContext';
import MenuButton from './MenuButton';
import { ClientSocketProvider } from '../contexts/ClientSocketContext';
import { FriendsProvider } from '../contexts/FriendsContext';
import { UserStatusProvider } from '../contexts/UserStatusContext';

import { BrowserWindowProvider } from '../contexts/BrowserWindowContext';
import { makeClickthrough } from '../config/clickthrough';
import { ipcRenderer } from 'electron';

const Border = () => {
  return <div style={{ float: 'left', minWidth: 8 }}>&nbsp;</div>;
};

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
