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
const frame = css({
  display: 'block',
  flexGrow: 0,
  flexShrink: 1,
  flexBasis: 'auto',
  alignSelf: 'right',
  order: '0',
  backgroundColor: colors.depressedWhite,
});
const body = css({
  display: 'block',
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: 'auto',
  alignSelf: 'auto',
  order: 0,
  backgroundColor: 'white',
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

const FrameButtons = () => {
  const color = 'white';

  const hoverAnimation = {
    opacity: 0.5,
    transition: { duration: 0.1 },
  };

  const tapAnimation = {
    opacity: 0.3,
    transition: {
      duration: 0.1,
    },
  };

  const handleMinimize = () => {
    BrowserWindow.getFocusedWindow().minimize();
  };

  const handleMaximize = () => {
    const maximized = BrowserWindow.getFocusedWindow().isMaximized();

    maximized
      ? BrowserWindow.getFocusedWindow().unmaximize()
      : BrowserWindow.getFocusedWindow().maximize();
  };

  const handleClose = () => {
    BrowserWindow.getFocusedWindow().close();
  };

  return (
    <>
      <motion.span
        className="undraggable"
        whileHover={hoverAnimation}
        whileTap={tapAnimation}
        onClick={() => handleMinimize()}
      >
        <VscChromeMinimize color={color} />
      </motion.span>
      <motion.span
        className="undraggable"
        whileHover={hoverAnimation}
        whileTap={tapAnimation}
        onClick={() => handleMaximize()}
      >
        <BsCircle color={color} />
      </motion.span>
      <motion.span
        className="undraggable"
        whileHover={hoverAnimation}
        whileTap={tapAnimation}
        onClick={() => handleClose()}
      >
        <IoIosClose color={color} />
      </motion.span>
    </>
  );
};

export default function FindFriendsPopUp() {
  const [token, setToken] = useLocalStorage('token');
  const [foundFriends, setFoundFriends] = useState(null);
  const [searchValue, setSearchValue] = useState(null);

  useEffect(() => {
    if (!searchValue) {
      setFoundFriends(null);
    }

    const searchTimeout = setTimeout(() => search(searchValue), 150);

    return () => clearTimeout(searchTimeout);
  }, [searchValue]);

  ipcRenderer.once('initialValue', (event, value) => {
    setSearchValue(value);
    search(value);
  });

  const search = (value) => {
    if (value) {
      DAO.searchUsers(value, token)
        .then((res) => {
          const users = res.data;
          setFoundFriends(users);
        })
        .catch((e) => console.log(e));
    }
  };

  const handleSearchInput = (evt) => {
    setSearchValue(evt.target.value);
  };

  return (
    <div className={container()}>
      <div className={[frame(), 'draggable', 'clickable'].join(' ')}>
        <FrameButtons />
      </div>
      <div className={[body(), 'undraggable'].join(' ')}>
        <input
          className={[searchInputStyle(), 'undraggable', 'clickable'].join(' ')}
          placeholder="Find friends..."
          type="text"
          value={searchValue || ''}
          onChange={handleSearchInput}
          // focus={searchInputFocus}
        />
        <div className={searchResultsStyle()}>
          {foundFriends &&
            foundFriends.map((user, index) => (
              <UserItem user={user} index={index} />
            ))}
        </div>
      </div>
    </div>
  );
}
