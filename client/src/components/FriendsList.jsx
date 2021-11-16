import React, { useState, useEffect, useRef } from 'react';
import { css } from '@stitches/react';

import '../App.global.css';
import { motion } from 'framer-motion';

import AccordionItem from './AccordionItem';
import { useAuth } from '../contexts/AuthContext';
import colors from '../config/colors';
import { getObjectByProp } from '../helpers/arrayTools';
import DAO from '../config/dao';
import FindFriendsPopUp from './FindFriendsPopUp';
import FriendRequestsAccordion from './FriendRequestsAccordion';
import { socket } from '../config/socket';
import UserStatus from './UserStatus';

const electron = require('electron');
const app = electron.remote.app;
const BrowserWindow = electron.remote.BrowserWindow;

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

  UserStatus();

  const searchInputRef = useRef();

  const [findFriendsOpen, setFindFriendsOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState(null);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [searchValue, setSearchValue] = useState(null);
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
        setFriends(res.data);
      })
      .catch((e) => {
        console.log(e);
        //show some error component
      });
  };

  const getFriendRequests = () => {
    DAO.getFriendRequests(currentUser._id, token)
      .then((res) => {
        res.data.friendRequests.forEach((object, index) => {
          object.key = index;
        });

        setFriendRequests(res.data.friendRequests);
      })
      .catch((e) => {
        console.log(e);
        //show some error component
      });
  };

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

  const handleNameChange = (evt) => {
    setUserName(evt.target.value);
    setName(evt.target.value);
  };

  useEffect(() => {
    getFriends();
    getFriendRequests();

    socket.on('friendrequest:receive', () => {
      getFriendRequests();
    });

    socket.on('friendrequest:cancelreceive', () => {
      getFriendRequests();
    });
  }, []);

  useEffect(() => {
    if (friends) {
      setActivityListeners();
    }
  }, [friends]);

  useEffect(() => {
    if (!friends.length) searchInputRef?.current?.focus();
  }, [searchInputRef?.current]);

  const setActivityListeners = () => {
    socket.removeAllListeners('activity:receive');

    socket.once('activity:receive', (packet) => {
      // Set activities in friends array
      setFriends((prevState) => {
        return prevState.map((friend) => {
          if (friend._id === packet.userID) {
            friend.activity?.push(packet.data);
            return {
              ...friend,
              activity: packet.data,
            };
          }
          return friend;
        });
      });
    });
  };

  return (
    <div className={container()}>
      <AccordionItem
        friend={friends.find((friend) => friend._id === currentUser._id)}
        handleNameChange={handleNameChange}
      />

      <input
        placeholder="Search... 🔍"
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

      <FriendRequestsAccordion
        friendRequests={friendRequests}
        getFriends={getFriends} // To refresh friends list after accepting a friend request
        getFriendRequests={getFriendRequests} // Same thing here
      />

      {searchValue
        ? filteredFriends.map((friend) => <AccordionItem friend={friend} />)
        : friends.length
        ? friends.map((friend) => <AccordionItem friend={friend} />)
        : // <h2>you have no friends Sadge</h2>
          null}
    </div>
  );
}
