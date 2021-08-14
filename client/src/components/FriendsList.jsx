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

  const [findFriendsOpen, setFindFriendsOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [searchValue, setSearchValue] = useState();
  const [searchInputFocus, setSearchInputFocus] = useState(null);
  const [findFriendsWindow, setFindFriendsWindow] = useState(
    new BrowserWindow({
      show: false,
      frame: false,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
      },
    })
  );

  const handleSearchInput = (evt) => {
    setSearchValue(evt.target.value);

    setFilteredFriends(
      evt.target.value
        ? friends.filter((friend) =>
            friend.Name.toLowerCase().includes(evt.target.value.toLowerCase())
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
        setFindFriendsWindow(
          new BrowserWindow({
            show: false,
            frame: false,
            webPreferences: {
              nodeIntegration: true,
              enableRemoteModule: true,
            },
          })
        );
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

  // // if there is no search term, set filteredFriends to null so
  // // it rerenders the regular friends list
  // useEffect(() => {
  //   if (!searchValue) setFilteredFriends(null);
  // }, [searchValue]);

  useEffect(() => {
    if (!friends.length) searchInputRef?.current?.focus();
  }, [searchInputRef?.current]);

  return (
    <div className={container()}>
      {searchValue ? (
        filteredFriends.map((friend) => <AccordionItem friend={friend} />)
      ) : friends.length ? (
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
          if (!friends.length) {
            console.log('no friends onblur');
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
    </div>
  );
}
