import React, { useState, useEffect, useRef } from 'react';
import { css } from '@stitches/react';

import '../App.global.css';
import { AnimatePresence, motion } from 'framer-motion';

import AccordionItem from './AccordionItem';
import colors from '../config/colors';
import FriendRequestsAccordion from './FriendRequestsAccordion';
import { useClientSocket } from '../contexts/ClientSocketContext';
import { useFriends } from '../contexts/FriendsContext';
import { useSelector } from 'react-redux';
import { getCurrentUser } from '../mainState/features/settingsSlice';
import WidgetFooter from './WidgetFooter';
import MenuButton from './MenuButton';

const electron = require('electron');
const app = electron.remote.app;
const BrowserWindow = electron.remote.BrowserWindow;
const ipcRenderer = electron.ipcRenderer;

const container = css({
  display: 'flex',
  flexFlow: 'column',
  height: '100vh',
  pointerEvents: 'auto',
  backgroundColor: 'transparent',
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

const EmptySpaceFiller = ({
  setExpandedMasterToggle,
  expandedMasterToggle,
}) => {
  return (
    <div
      style={{ flex: '1 1 auto', backgroundColor: colors.offWhite, zIndex: 60 }}
      onClick={() => setExpandedMasterToggle(!expandedMasterToggle)}
    />
  );
};

export default function FriendsList() {
  const currentUser = useSelector(getCurrentUser);
  const { socket } = useClientSocket();
  const {
    friends,
    getFriends,
    findFriends,
    filteredFriends,
    getFriendRequests,
    friendRequests,
  } = useFriends();

  const [findFriendsOpen, setFindFriendsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(null);
  const [findFriendsWindow, setFindFriendsWindow] = useState(
    new BrowserWindow(findFriendsWindowConfig)
  );
  const [expandedMasterToggle, setExpandedMasterToggle] = useState(false);

  ipcRenderer.on('refreshtoken:frommain', (e, currentUser) => {
    findFriendsWindow?.webContents.send(
      'refreshtoken:fromrenderer',
      currentUser
    );
  });

  const handleSearchInput = (evt) => {
    let searchTerm = evt.target.value;
    setSearchValue(searchTerm);

    findFriends(searchTerm);
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
    return () => findFriendsWindow?.close();
  }, []);
  useEffect(() => {
    console.log('wtf ', filteredFriends);
  }, [filteredFriends]);

  return (
    <>
      <MenuButton />
      <div className={container()} spellCheck="false">
        <div style={{ flex: '0 1 auto' }}>
          <AccordionItem
            username={currentUser?.username}
            friend={friends?.find((friend) => friend._id === currentUser?._id)}
            isWidgetHeader={true}
            handleNameChange={handleNameChange}
          />

          {friendRequests?.length > 0 && (
            <FriendRequestsAccordion
              friendRequests={friendRequests}
              getFriends={getFriends} // To refresh friends list after accepting a friend request
              getFriendRequests={getFriendRequests} // Same thing here
              expandedMasterToggle={expandedMasterToggle}
            />
          )}

          {searchValue
            ? filteredFriends?.map((friend) => (
                <AccordionItem
                  friend={friend}
                  expandedMasterToggle={expandedMasterToggle}
                />
              ))
            : friends.length
            ? friends.map((friend, index) => (
                <AccordionItem
                  key={index}
                  friend={friend}
                  expandedMasterToggle={expandedMasterToggle}
                />
              ))
            : null}
        </div>
        <EmptySpaceFiller
          setExpandedMasterToggle={setExpandedMasterToggle}
          expandedMasterToggle={expandedMasterToggle}
        />
        <WidgetFooter
          handleSearchInput={handleSearchInput}
          toggleFindFriends={toggleFindFriends}
          searchValue={searchValue}
          friends={friends}
        />
      </div>
    </>
  );
}
