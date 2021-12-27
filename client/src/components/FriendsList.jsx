import React, { useState, useEffect, useRef } from 'react';
import { css } from '@stitches/react';

import '../App.global.css';
import { motion } from 'framer-motion';

import AccordionItem from './AccordionItem';
import { useAuth } from '../contexts/AuthContext';
import colors from '../config/colors';
import DAO from '../config/dao';
import FriendRequestsAccordion from './FriendRequestsAccordion';
import { UserStatusProvider } from '../contexts/UserStatusContext';
import { useClientSocket } from '../contexts/ClientSocketContext';
import { useFriends } from '../contexts/FriendsContext';

const electron = require('electron');
const app = electron.remote.app;
const BrowserWindow = electron.remote.BrowserWindow;
const ipcRenderer = electron.ipcRenderer;

const container = css({ backgroundColor: colors.darkmodeBlack });

const searchInputStyle = css({
  WebkitAppearance: 'none',
  outline: 'none',
  border: 'none',
  backgroundColor: 'transparent',

  fontSize: '1.0em',
  fontWeight: 600,

  // width: '100%',
  margin: 15,
  marginLeft: 20,
  marginRight: 20,
});

const findButton = css({
  backgroundColor: colors.darkmodeBlack,
  padding: 10,
});

const findFriendsWindowConfig = {
  show: false,
  frame: false,
  transparent: true,
  width: 560,
  webPreferences: {
    nodeIntegration: true,
    enableRemoteModule: true,
  },
};

export default function FriendsList() {
  const { currentUser, token } = useAuth();
  const { socket } = useClientSocket();
  const {
    friends,
    getFriends,
    findFriends,
    getFriendRequests,
    friendRequests,
  } = useFriends();

  const searchInputRef = useRef();

  const [findFriendsOpen, setFindFriendsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(null);
  const [searchInputFocus, setSearchInputFocus] = useState(null);
  const [findFriendsWindow, setFindFriendsWindow] = useState(
    new BrowserWindow(findFriendsWindowConfig)
  );

  ipcRenderer.on('refreshtoken:frommain', (e, data) => {
    findFriendsWindow?.webContents.send('refreshtoken:fromrenderer', data);
  });

  const handleSearchInput = (evt) => {
    let searchTerm = evt.target.value;
    setSearchValue(searchTerm);

    findFriends(searchTerm);
  };

  const handleFindButtonClick = () => {
    toggleFindFriends();
  };

  const toggleFindFriends = () => {
    // ipcRenderer.send('findFriendsWindow:toggle');
    if (!findFriendsOpen) {
      findFriendsWindow.on('close', function () {
        setFindFriendsWindow(null);
      });
      findFriendsWindow.on('closed', function () {
        setFindFriendsWindow(new BrowserWindow(findFriendsWindowConfig));
        setFindFriendsOpen(false);
      });
      findFriendsWindow.loadURL(
        `file://${app.getAppPath()}/index.html#/findfriends`
      );

      findFriendsWindow.once('ready-to-show', () => {
        findFriendsWindow.webContents.send('initialValue', searchValue);

        findFriendsWindow.show();
        setFindFriendsOpen(true);
      });
    } else findFriendsWindow.focus();
  };

  const handleNameChange = (evt) => {
    setUserName(evt.target.value);
    setName(evt.target.value);
  };

  // useEffect(() => {
  //   if (friends && socket) {
  //     setActivityListeners();
  //   }
  // }, [friends, socket]);

  useEffect(() => {
    if (friends <= 0) searchInputRef?.current?.focus();
  }, [searchInputRef?.current]);

  useEffect(() => {
    return () => findFriendsWindow?.close();
  }, []);

  return (
    <UserStatusProvider>
      <div className={container()}>
        <AccordionItem
          friend={friends?.find((friend) => friend._id === currentUser?._id)}
          isWidgetHeader={true}
          handleNameChange={handleNameChange}
        />

        <input
          placeholder="Search... 🔍"
          type="text"
          value={searchValue || ''}
          onChange={handleSearchInput}
          className={searchInputStyle()}
          ref={searchInputRef}
          onKeyUp={(evt) => {
            if (evt.key === 'Enter') {
              toggleFindFriends();
            }
          }}
          onBlur={() => {
            if (friends.length <= 0) {
              setSearchInputFocus(true);
              searchInputRef?.current?.focus();
            }
          }}
          focus={searchInputFocus}
        />

        {searchValue && (
          <div onClick={handleFindButtonClick} className={findButton()}>
            Find '{searchValue}'
          </div>
        )}

        <FriendRequestsAccordion
          friendRequests={friendRequests}
          getFriends={getFriends} // To refresh friends list after accepting a friend request
          getFriendRequests={getFriendRequests} // Same thing here
        />

        {searchValue
          ? filteredFriends.map((friend) => <AccordionItem friend={friend} />)
          : friends.length
          ? friends.map((friend, index) => (
              <AccordionItem key={index} friend={friend} />
            ))
          : null}
      </div>
    </UserStatusProvider>
  );
}
