import React, { useState, useEffect, useRef } from 'react';
import { css } from '@stitches/react';

import '../App.global.css';
import { motion } from 'framer-motion';

import AccordionItem from './AccordionItem';
import { useAuth } from '../contexts/AuthContext';
import colors from '../config/colors';
import { getObjectByProp } from '../helpers/arrayTools';
import DAO from '../config/dao';
import UserItem from './UserItem';
import FindFriendsPopUp from './FindFriendsPopUp';
import FriendRequestsAccordion from './FriendRequestsAccordion';

const electron = require('electron');
const app = electron.remote.app;
const BrowserWindow = electron.remote.BrowserWindow;

const container = css({ backgroundColor: colors.classyWhite });

const searchInputStyle = css({
  WebkitAppearance: 'none',
  outline: 'none',
  border: 'none',
  backgroundColor: 'transparent',

  fontSize: '1.0em',
  fontWeight: 600,

  width: '100%',
  padding: 15,
  paddingLeft: 20,
  paddingRight: 20,
});

const findButton = css({
  backgroundColor: 'white',
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

  const searchInputRef = useRef();

  const [findFriendsOpen, setFindFriendsOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([
    { _id: '2141241', username: 'minge' },
  ]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [searchValue, setSearchValue] = useState();
  const [searchInputFocus, setSearchInputFocus] = useState(null);
  const [findFriendsWindow, setFindFriendsWindow] = useState(
    new BrowserWindow(findFriendsWindowConfig)
  );

  const getFriends = () => {
    DAO.getFriends(currentUser._id, token)
      .then((res) => {
        res.data.forEach((object, index) => {
          object.key = index;
        });
        console.log('frents ', res.data);
        setFriends(res.data);
      })
      .catch((e) => {
        console.log(e);
        //show some error component
      });
  };

  const getFriendRequests = () => {};

  const handleSearchInput = (evt) => {
    setSearchValue(evt.target.value);

    setFilteredFriends(
      evt.target.value
        ? friends.filter((friend) =>
            friend.username
              .toLowerCase()
              .includes(evt.target.value.toLowerCase())
          )
        : null
    );
  };

  const handleFindButtonClick = () => {
    toggleFindFriends();
  };

  const toggleFindFriends = () => {
    if (!findFriendsOpen) {
      // FindFriendsPopUp window

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

  useEffect(() => {
    getFriends();
    getFriendRequests();
  }, []);

  useEffect(() => {
    if (!friends.length) searchInputRef?.current?.focus();
  }, [searchInputRef?.current]);

  return (
    <div className={container()}>
      <input
        placeholder="Find friends..."
        type="text"
        value={searchValue || ''}
        onChange={handleSearchInput}
        className={searchInputStyle()}
        ref={searchInputRef}
        onBlur={() => {
          if (!friends.length) {
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

      <FriendRequestsAccordion friendRequests={friendRequests} />

      {searchValue
        ? filteredFriends.map((friend) => <AccordionItem friend={friend} />)
        : friends.length
        ? friends.map((friend) => <AccordionItem friend={friend} />)
        : // <h2>you have no friends Sadge</h2>
          null}
    </div>
  );
}
