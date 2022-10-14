import React, { useEffect } from 'react';

import styles from './Widget.module.css';

import colors from '../config/colors';
import FriendsList from './FriendsList';
import { AuthProvider } from '../contexts/AuthContext';
import MenuButton from './MenuButton';
import { ClientSocketProvider } from '../contexts/ClientSocketContext';
import { FriendsProvider } from '../contexts/FriendsContext';
import UserStatusProvider from '../contexts/UserStatusContext';
import { Memoized } from './reusables/Memoized';

import BrowserWindowProvider from '../contexts/BrowserWindowContext';
import { ipcRenderer } from 'electron';

const Border = () => {
  return <div style={{ float: 'left', minWidth: 8 }}>&nbsp;</div>;
};

export default function Widget() {
  window.onbeforeunload = (e) => {
    e.returnValue = false; // Cancels close, true unclosable
  };

  useEffect(() => {
    ipcRenderer.once('exit:frommain', () => {
      window.onbeforeunload = (e) => {
        e.returnValue = undefined;
      };
    });
  }, []);
  return (
    <BrowserWindowProvider>
      <AuthProvider>
        <ClientSocketProvider>
          <FriendsProvider>
            <UserStatusProvider>
              <Memoized>
                <Border />
                <MenuButton />

                <FriendsList />
              </Memoized>
            </UserStatusProvider>
          </FriendsProvider>
        </ClientSocketProvider>
      </AuthProvider>
    </BrowserWindowProvider>
  );
}
