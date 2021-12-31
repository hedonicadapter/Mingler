import React, { useState, useEffect } from 'react';
import { css } from '@stitches/react';
import { motion } from 'framer-motion';
import { VscChromeMinimize } from 'react-icons/vsc';
import { BsCircle } from 'react-icons/bs';
import { IoIosClose } from 'react-icons/io';

import UserItem from './UserItem';
import { useLocalStorage } from '../helpers/localStorageManager';
import DAO from '../config/DAO';
import colors from '../config/colors';
import { WindowFrame } from './reusables/WindowFrame';
import { useSelector } from 'react-redux';

const { remote } = require('electron');
const BrowserWindow = remote.BrowserWindow;
const ipcRenderer = require('electron').ipcRenderer;

const container = css({
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'nowrap',
  justifyContent: 'normal',
  alignItems: 'stretch',
  alignContent: 'normal',
});

const searchInputStyle = css({
  WebkitAppearance: 'none',
  outline: 'none',
  border: 'none',
  backgroundColor: 'transparent',

  fontSize: '1.0em',
  fontWeight: 600,

  overflow: 'hidden',

  width: '100%',
  padding: 15,
  // paddingRight: 30,
});

const searchResultsStyle = css({
  overflow: 'auto',
});

export default function FindFriendsPopUp() {
  const [userID, setUserID] = useLocalStorage('userID');
  const [token, setToken] = useLocalStorage('token');
  const [foundFriends, setFoundFriends] = useState(null);
  const [searchValue, setSearchValue] = useState(null);
  const [sentFriendRequests, setSentFriendRequests] = useState(null);

  useEffect(() => {
    // this makes it work when the token updates for some reason smh
    console.log('friends ', foundFriends);
  }, [foundFriends]);

  let timeouts = [];

  useEffect(() => {
    timeouts.push(setTimeout(() => search(searchValue), 150));

    if (!searchValue) {
      timeouts.forEach((item) => clearTimeout(item));
      setFoundFriends(null);
    }

    return () => timeouts.forEach((item) => clearTimeout(item));
  }, [searchValue]);

  useEffect(() => {
    getSentFriendRequests();

    ipcRenderer.on('refreshtoken:fromrenderer', (e, { access, refresh }) => {
      setToken(access);
    });
  }, []);

  ipcRenderer.once('initialValue', (event, value) => {
    setSearchValue(value);
    search(value);
  });

  const search = (value) => {
    if (value) {
      DAO.searchUsers(value, token)
        .then((res) => {
          const users = res.data.filter((user) => user._id != userID);
          setFoundFriends(users);
        })
        .catch((e) => console.log(e));
    }
  };

  const getSentFriendRequests = () => {
    DAO.getSentFriendRequests(userID, token)
      .then((res) => {
        setSentFriendRequests(res.data.sentFriendRequests || 'none');
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const handleSearchInput = (evt) => {
    setSearchValue(evt.target.value);
  };

  const handleSendRequestButton = (toID) => {
    DAO.sendFriendRequest(toID, userID, token)
      .then((res) => {
        setSentFriendRequests((oldValue) => [...oldValue, toID]);
        ipcRenderer.send('sendfriendrequest:fromrenderer', { toID });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const handleCancelRequestButton = (toID) => {
    DAO.cancelFriendRequest(toID, userID, token)
      .then((res) => {
        const updatedRequests = sentFriendRequests.filter(
          (item) => item !== toID
        );

        setSentFriendRequests(updatedRequests);
        ipcRenderer.send('cancelfriendrequest:fromrenderer', { toID });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const handleEscapeKey = (event) => {
    if (event.keyCode === 27) {
      BrowserWindow.getFocusedWindow().close();
    }
  };

  return (
    <div className={container()} onKeyDown={handleEscapeKey}>
      <WindowFrame>
        <input
          className={[searchInputStyle(), 'undraggable', 'clickable'].join(' ')}
          placeholder="Find friends..."
          type="text"
          value={searchValue || ''}
          onChange={handleSearchInput}
        />
        <div className={searchResultsStyle()}>
          {foundFriends &&
            sentFriendRequests &&
            foundFriends.map((user, index) => (
              <UserItem
                user={user}
                requestSent={sentFriendRequests.includes(user._id)}
                index={index}
                handleSendRequestButton={handleSendRequestButton}
                handleCancelRequestButton={handleCancelRequestButton}
              />
            ))}
        </div>
      </WindowFrame>
    </div>
  );
}
