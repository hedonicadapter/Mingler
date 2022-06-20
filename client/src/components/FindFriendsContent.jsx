import React, { useState, useEffect } from 'react';
import { css } from '@stitches/react';
import { motion } from 'framer-motion';
import { VscChromeMinimize } from 'react-icons/vsc';
import { BsCircle } from 'react-icons/bs';
import { IoIosClose } from 'react-icons/io';

import UserItem from './UserItem';
import DAO from '../config/DAO';
import colors from '../config/colors';
import { WindowFrame } from './reusables/WindowFrame';
import { useDispatch, useSelector } from 'react-redux';
import {
  getCurrentUser,
  setAccessTokenMain,
  setCurrentUserMain,
  setRefreshTokenMain,
} from '../mainState/features/settingsSlice';
import {
  getApp,
  setFindFriendsSearchValue,
} from '../mainState/features/appSlice';
import { makeClickthrough } from '../config/clickthrough';
import { profilePictureToJSXImg } from '../helpers/fileManager';

const { remote } = require('electron');
const BrowserWindow = remote.BrowserWindow;
const ipcRenderer = require('electron').ipcRenderer;

const container = css({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'nowrap',
  pointerEvents: 'auto',
  backgroundColor: colors.offWhite,
});
const header = css({ flexShrink: 0 });
const body = css({ flexGrow: '1', overflow: 'auto' });

const searchInputStyle = css({
  WebkitAppearance: 'none',
  outline: 'none',
  border: 'none',

  fontSize: '1.0em',
  // fontWeight: 600,

  overflow: 'hidden',

  width: '100%',
  padding: 14,
  color: colors.darkmodeDisabledText,
});

const searchResultsStyle = css({
  height: '100vh',
  overflowY: 'scroll',
  scrollbarGutter: 'stable',
});

export default function FindFriendsContent() {
  makeClickthrough();

  const [friends, setFriends] = useState([]);
  const [foundFriends, setFoundFriends] = useState([]);
  const [sentFriendRequests, setSentFriendRequests] = useState(null);

  const currentUser = useSelector(getCurrentUser);
  const appState = useSelector(getApp);

  const dispatch = useDispatch();

  useEffect(() => {
    // this seems to make it work when the token updates for some reason smh
    console.log('friends ', foundFriends);
  }, [foundFriends]);

  let timeouts = [];

  useEffect(() => {
    timeouts.push(
      setTimeout(() => search(appState?.findFriendsSearchValue), 150)
    );

    if (!appState?.findFriendsSearchValue) {
      timeouts.forEach((item) => clearTimeout(item));
      setFoundFriends(null);
    }

    return () => timeouts.forEach((item) => clearTimeout(item));
  }, [appState?.findFriendsSearchValue]);

  useEffect(() => {
    getSentFriendRequests();

    ipcRenderer.on('friends', (e, friends) => {
      setFriends(friends);
    });
  }, []);

  ipcRenderer.once('initialValue', (event, value) => {
    dispatch(setFindFriendsSearchValue(value));
    search(value);
  });

  const search = (value) => {
    if (value) {
      DAO.searchUsers(value, currentUser.accessToken)
        .then((res) => {
          const users = res.data.filter((user) => user._id != currentUser._id);

          users.forEach((object, index) => {
            object.key = index;

            // format profile picture objects to JSX img elements
            if (object.profilePicture) {
              object.profilePicture = profilePictureToJSXImg(
                object.profilePicture
              );
            }
          });

          setFoundFriends(users);
        })
        .catch((e) => console.log(e));
    }
  };

  const getSentFriendRequests = () => {
    DAO.getSentFriendRequests(currentUser._id, currentUser.accessToken)
      .then((res) => {
        setSentFriendRequests(res.data.sentFriendRequests || 'none');
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const handleSearchInput = (evt) => {
    dispatch(setFindFriendsSearchValue(evt.target.value));
  };

  const handleSendRequestButton = (toID) => {
    DAO.sendFriendRequest(toID, currentUser._id, currentUser.accessToken)
      .then((res) => {
        setSentFriendRequests((oldValue) => [...oldValue, toID]);
        ipcRenderer.send('sendfriendrequest:fromrenderer', { toID });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const handleCancelRequestButton = (toID) => {
    DAO.cancelFriendRequest(toID, currentUser._id, currentUser.accessToken)
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
    <div className={container()}>
      <header className={header()}>
        <WindowFrame />
        <div onKeyDown={handleEscapeKey}>
          <motion.input
            className={[searchInputStyle(), 'undraggable', 'clickable'].join(
              ' '
            )}
            whileHover={{
              color: colors.darkmodeLightBlack,
            }}
            whileFocus={{ color: colors.darkmodeBlack }}
            transition={{ duration: 0.1 }}
            placeholder="Find friends..."
            type="text"
            value={appState?.findFriendsSearchValue || ''}
            onChange={handleSearchInput}
            style={{ backgroundColor: colors.offWhite }}
          />
        </div>
      </header>
      <div className={body()}>
        {foundFriends?.map((user, index) => (
          <UserItem
            key={index}
            user={user}
            requestSent={sentFriendRequests.includes(user._id)}
            profilePicture={user.profilePicture}
            alreadyFriends={
              !Array.isArray(friends) || !friends.length
                ? false
                : friends.some((friend) => friend._id === user._id)
            }
            index={index}
            handleSendRequestButton={handleSendRequestButton}
            handleCancelRequestButton={handleCancelRequestButton}
          />
        ))}
      </div>
    </div>
  );
}
