import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { VscChromeMinimize } from 'react-icons/vsc';
import { BsCircle } from 'react-icons/bs';
import { IoIosClose } from 'react-icons/io';

import styles from './FindFriendsContent.module.css';
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
import useDebounce from '../helpers/useDebounce';
import genericErrorHandler from '../helpers/genericErrorHandler';

const { remote } = require('electron');
const BrowserWindow = remote.BrowserWindow;
const ipcRenderer = require('electron').ipcRenderer;

export default function FindFriendsContent() {
  makeClickthrough();

  const [friends, setFriends] = useState([]);
  const [foundFriends, setFoundFriends] = useState([]);
  const [sentFriendRequests, setSentFriendRequests] = useState(null);
  const [error, setError] = useState(null);

  const currentUser = useSelector(getCurrentUser);
  const appState = useSelector(getApp);

  const dispatch = useDispatch();

  useEffect(() => {
    const errorTimeout = setTimeout(() => setError(null), 3000);

    return () => clearTimeout(errorTimeout);
  }, [error]);

  useEffect(() => {
    console.log('friends ', foundFriends);
  }, [foundFriends]);

  useEffect(() => {
    if (!appState?.findFriendsSearchValue) {
      setFoundFriends(null);
    }
  }, [appState?.findFriendsSearchValue]);

  // TODO: react 18 - replace with useDeferredValue
  useDebounce(() => search(appState?.findFriendsSearchValue), 350, [
    appState?.findFriendsSearchValue,
  ]);

  useEffect(() => {
    getSentFriendRequests();

    ipcRenderer.on('friends', setFriendsFromOtherWindowHandler);

    ipcRenderer.once('initialValue', findFriendsInitialSearchValueHandler);

    return () => {
      ipcRenderer.removeAllListeners(
        'friends',
        setFriendsFromOtherWindowHandler
      );
      ipcRenderer.removeAllListeners(
        'initialValue',
        findFriendsInitialSearchValueHandler
      );
    };
  }, []);

  const search = (value) => {
    if (!value) return;

    DAO.searchUsers(value, currentUser.accessToken)
      .then((res) => {
        if (res?.data?.success) {
          const users = res.data?.searchResults?.filter(
            (user) => user._id != currentUser._id
          );

          users.forEach((object, index) => {
            object.key = index;
          });

          setFoundFriends(users);
          setError(null);
        }
      })
      .catch(genericErrorHandler);
  };

  const getSentFriendRequests = () => {
    DAO.getSentFriendRequests(currentUser._id, currentUser.accessToken)
      .then((res) => {
        if (res?.data?.success) {
          setSentFriendRequests(res.data.sentFriendRequests || 'none');
          setError(null);
        }
      })
      .catch((e) => {
        setError(e?.response?.data?.error);
      });
  };

  const handleSearchInput = (evt) => {
    // don't search unless window is up
    if (!remote.getCurrentWindow().isVisible()) return;

    dispatch(setFindFriendsSearchValue(evt.target.value));
  };

  const handleSendRequestButton = async (toID) => {
    if (currentUser?.demoUser) {
      setSentFriendRequests((oldValue) => [...oldValue, toID]);

      return { success: true, demo: true };
    }

    return await DAO.sendFriendRequest(
      toID,
      currentUser._id,
      currentUser.accessToken
    )
      .then((res) => {
        console.log('send request ', res);
        if (res?.data?.success) {
          setSentFriendRequests((oldValue) => [...oldValue, toID]);

          ipcRenderer.send('sendfriendrequest:fromrenderer', toID);

          return { success: true };
        }
      })
      .catch(genericErrorHandler);
  };

  const handleCancelRequestButton = async (toID) => {
    if (currentUser?.demoUser) {
      const updatedRequests = sentFriendRequests.filter(
        (item) => item !== toID
      );

      setSentFriendRequests(updatedRequests);

      return { success: true, demo: true };
    }

    return await DAO.cancelFriendRequest(
      toID,
      currentUser._id,
      currentUser.accessToken
    )
      .then((res) => {
        if (res?.data?.success) {
          const updatedRequests = sentFriendRequests.filter(
            (item) => item !== toID
          );

          setSentFriendRequests(updatedRequests);

          ipcRenderer.send('cancelfriendrequest:fromrenderer', toID);

          return { success: true };
        }
      })
      .catch(genericErrorHandler);
  };

  const handleEscapeKey = (event) => {
    if (event.keyCode === 27) {
      BrowserWindow.getFocusedWindow().close();
    }
  };

  const setFriendsFromOtherWindowHandler = (e, friends) => {
    setFriends(friends);
  };

  const findFriendsInitialSearchValueHandler = (event, value) => {
    dispatch(setFindFriendsSearchValue(value));
    search(value);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <WindowFrame title={'Find friends'} />
        <div className={styles.inputContainer} onKeyDown={handleEscapeKey}>
          <motion.input
            className={[
              styles.searchInputStyle,
              'undraggable',
              'clickable',
            ].join(' ')}
            whileHover={{
              color: error ? colors.coffeeRed : colors.darkmodeLightBlack,
            }}
            whileFocus={{
              color: error ? colors.coffeeRed : colors.darkmodeBlack,
            }}
            transition={{ duration: 0.1 }}
            placeholder="Find friends..."
            type="text"
            value={error ? error : appState?.findFriendsSearchValue || ''}
            readOnly={error ? true : false}
            onChange={handleSearchInput}
            style={{
              color: error ? colors.coffeeRed : colors.darkmodeDisabledText,
              cursor: error ? 'default' : 'auto',
            }}
          />
        </div>
      </header>
      <div className={styles.body}>
        {foundFriends?.map((user, index) => (
          <div className={styles.userItemContainer} key={index}>
            <UserItem
              findFriendsContent={true}
              user={user}
              requestSent={sentFriendRequests.includes(user._id)}
              alreadyFriends={
                !Array.isArray(friends) || !friends.length
                  ? false
                  : friends.some((friend) => friend._id === user._id)
              }
              index={index}
              handleSendRequestButton={handleSendRequestButton}
              handleCancelRequestButton={handleCancelRequestButton}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
