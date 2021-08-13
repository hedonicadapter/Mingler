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
  paddingLeft: 30,
  paddingRight: 30,
});

const findButton = css({
  backgroundColor: 'white',
  padding: 10,
});

export default function FriendsList() {
  const { currentUser, token } = useAuth();

  const searchInputRef = useRef();

  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [searchValue, setSearchValue] = useState();
  const [findFriendsVisible, setFindFriendsVisible] = useState(false);
  const [foundFriends, setFoundFriends] = useState(null);
  const [searchInputFocus, setSearchInputFocus] = useState(null);

  const handleSearchInput = (evt) => {
    setSearchValue(evt.target.value);

    setFilteredFriends(
      evt.target.value
        ? friends.filter((friend) =>
            friend.Name.toLowerCase().includes(evt.target.value.toLowerCase())
          )
        : friends
    );
  };

  const handleFindButtonClick = () => {
    DAO.searchUsers(searchValue, token)
      .then((res) => {
        const users = res.data;
        setFoundFriends(users);
        toggleFindFriends();
      })
      .catch((e) => console.log(e));
  };

  const toggleFindFriends = () => {
    // setFindFriendsVisible(!findFriendsVisible);
    // const injectScript = (win) => {
    //   win.webContents
    //     .executeJavaScript('window.location.href.toString()')
    //     .then((result) => {});
    // };

    let win = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
      },
    });
    win.on('close', function () {
      win = null;
    });
    win.loadURL(`file://${app.getAppPath()}/index.html#/findfriends`);
    win.once('ready-to-show', () => {
      win.show();

      // injectScript(win);
    });
  };

  // Get friends
  useEffect(() => {
    DAO.getFriends(currentUser._id, token)
      .then((res) => {
        res.data.forEach((object, index) => {
          object.key = index;
        });
        setFriends(res.data);
      })
      .catch((e) => {
        console.log(e);
        //show some error component
      });
  }, []);

  useEffect(() => {
    if (!friends) searchInputRef?.current?.focus();
  }, [searchInputRef?.current]);

  return (
    <div className={container()}>
      {friends.length ? (
        !findFriendsVisible &&
        friends.map((friend) => <AccordionItem friend={friend} />)
      ) : (
        <div className={container()}>
          <h1>you have no friends Sadge</h1>
        </div>
      )}

      <input
        placeholder="Find friends..."
        type="text"
        value={searchValue || ''}
        onChange={handleSearchInput}
        className={searchInputStyle()}
        ref={searchInputRef}
        onBlur={() => {
          if (!friends) {
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

      {findFriendsVisible &&
        foundFriends &&
        foundFriends.map((user) => <UserItem user={user} />)}
    </div>
  );
}
