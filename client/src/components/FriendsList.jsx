import React, { useState, useEffect, useRef } from 'react';
import { css } from '@stitches/react';

import '../App.global.css';
import { motion } from 'framer-motion';

import AccordionItem from './AccordionItem';
import { useAuth } from '../contexts/AuthContext';
import colors from '../config/colors';
import { getObjectByProp } from '../helpers/arrayTools';
import DAO from '../config/dao';
import FriendRequestsAccordion from './FriendRequestsAccordion';
import { UserStatusProvider } from '../contexts/UserStatusContext';
import { useClientSocket } from '../contexts/ClientSocketContext';

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
  const { socket } = useClientSocket;

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

  ipcRenderer.on('refreshtoken:frommain', (e, data) => {
    findFriendsWindow?.webContents.send('refreshtoken:fromrenderer', data);
  });

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

  // Ensure activities remain unique.
  // E.g. if a user switches from one tab to another tab
  // it replaces that tab activity with the new tab activity.
  // Also prevents track activities counting as window activities.
  const manageActivities = (activitiesArray, newActivity) => {
    const newWindow = newActivity?.WindowTitle;
    const newTrack = newActivity?.TrackTitle;
    const newChromiumTab = newActivity?.TabTitle;
    const newYoutube = newActivity?.YouTubeTitle;

    let windowActivityExists = activitiesArray?.findIndex(
      (actvt) => actvt.WindowTitle
    );
    let trackActivityExists = activitiesArray?.findIndex(
      (actvt) => actvt.TrackTitle
    );
    let chromiumActivityExists = activitiesArray?.findIndex(
      (actvt) => actvt.TabTitle
    );
    let youtubeActivityExists = activitiesArray?.findIndex(
      (actvt) => actvt.YouTubeTitle
    );

    if (windowActivityExists > -1 && newWindow) {
      activitiesArray[windowActivityExists] = newActivity;
      return;
    } else if (newWindow) {
      // Prevents tracks being counted as windows
      if (activitiesArray?.filter((actvt) => actvt.TrackTitle != newWindow)) {
        activitiesArray?.push(newActivity);
        return;
      }
    }

    if (trackActivityExists > -1 && newTrack) {
      activitiesArray[trackActivityExists] = newActivity;
      return;
    } else if (newTrack) {
      activitiesArray?.push(newActivity);
      return;
    }

    if (chromiumActivityExists > -1 && newChromiumTab) {
      activitiesArray[chromiumActivityExists] = newActivity;
      return;
    } else if (newChromiumTab) {
      activitiesArray?.push(newActivity);
      return;
    }

    if (youtubeActivityExists > -1 && newYoutube) {
      activitiesArray[youtubeActivityExists] = newActivity;
      return;
    } else if (newYoutube) {
      activitiesArray?.push(newActivity);
      return;
    }
  };

  // Expand functionality to include favorites
  // and other stuff in the future
  const sortActivities = (activitiesArray) => {
    activitiesArray?.sort((a, b) => {
      return new Date(b.Date) - new Date(a.Date);
    });
  };

  useEffect(() => {
    getFriends();
    getFriendRequests();

    socket?.on('friendrequest:receive', () => {
      getFriendRequests();
    });

    socket?.on('friendrequest:cancelreceive', () => {
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
    socket?.removeAllListeners('activity:receive');

    socket?.once('activity:receive', (packet) => {
      // console.log('datatata ', packet.data);
      // Set activities in friends array
      setFriends((prevState) => {
        return prevState.map((friend) => {
          if (friend._id === packet.userID) {
            manageActivities(friend.activity, packet.data);
            sortActivities(friend.activity);

            return {
              ...friend,
              activity: friend.activity ? friend.activity : [packet.data],
            };
          }
          return friend;
        });
      });
    });
  };

  return (
    <UserStatusProvider>
      <div className={container()}>
        <AccordionItem
          friend={friends.find((friend) => friend._id === currentUser?._id)}
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
    </UserStatusProvider>
  );
}
