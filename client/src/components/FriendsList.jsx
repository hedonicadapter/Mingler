import React, { useState, useRef, useEffect } from 'react';
import { css } from '@stitches/react';

import '../App.global.css';
import { AnimatePresence, motion } from 'framer-motion';

import AccordionItem from './AccordionItem';
import colors from '../config/colors';
import FriendRequestsAccordion from './FriendRequestsAccordion';
import { useClientSocket } from '../contexts/ClientSocketContext';
import { useFriends } from '../contexts/FriendsContext';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from '../mainState/features/settingsSlice';
import WidgetFooter from './WidgetFooter';
import MenuButton from './MenuButton';
import {
  getApp,
  setFindFriendsSearchValue,
  toggleCardExpandedMasterToggle,
} from '../mainState/features/appSlice';
import { useBrowserWindow } from '../contexts/BrowserWindowContext';
import useDebounce from '../helpers/useDebounce';
import { makeClickthrough } from '../config/clickthrough';
import { ipcRenderer } from 'electron';

const container = css({
  display: 'flex',
  flexFlow: 'column',
  height: '100vh',
  backgroundColor: 'transparent',
});

export const EmptySpaceFiller = ({}) => {
  const dispatch = useDispatch();

  const contextMenuCollapseAllHandler = () => {
    dispatch(toggleCardExpandedMasterToggle());
  };

  useEffect(() => {
    ipcRenderer.on('context-menu:collapse-all', contextMenuCollapseAllHandler);

    return () => {
      ipcRenderer.removeAllListeners(
        'context-menu:collapse-all',
        contextMenuCollapseAllHandler
      );
    };
  }, []);

  return (
    <div
      style={{ flex: '1 1 auto', backgroundColor: colors.offWhite, zIndex: 60 }}
      onClick={contextMenuCollapseAllHandler}
    />
  );
};

export default function FriendsList() {
  // const setIgnoreMouseEvents =
  //   require('electron').remote.getCurrentWindow().setIgnoreMouseEvents;
  // addEventListener('pointerover', function mousePolicy(event) {
  //   mousePolicy._canClick =
  //     event.target === document.documentElement
  //       ? mousePolicy._canClick && setIgnoreMouseEvents(true, { forward: true })
  //       : mousePolicy._canClick || setIgnoreMouseEvents(false) || 1;
  // });
  // setIgnoreMouseEvents(true, { forward: true });

  makeClickthrough();

  const dispatch = useDispatch();

  const currentUser = useSelector(getCurrentUser);
  const appState = useSelector(getApp);

  const { acceptFriendRequest } = useClientSocket();
  const {
    friends,
    getFriends,
    getConversations,
    findFriends,
    filteredFriends,
    getFriendRequests,
    friendRequests,
  } = useFriends();

  const handleSearchInput = (evt) => {
    let searchValue = evt.target.value;
    dispatch(setFindFriendsSearchValue(searchValue));
  };

  // TODO: react 18 - replace with useDeferredValue
  useDebounce(() => findFriends(appState?.findFriendsSearchValue), 1000, [
    appState?.findFriendsSearchValue,
  ]);

  const handleNameChange = (evt) => {
    setUserName(evt.target.value);
    setName(evt.target.value);
  };

  return (
    <>
      <MenuButton />
      <div
        onContextMenu={() => ipcRenderer.send('context-menu')}
        className={container()}
        spellCheck="false"
      >
        <div style={{ flex: '0 1 auto' }}>
          <AccordionItem
            username={currentUser?.username}
            friend={friends?.find((friend) => friend._id === currentUser?._id)}
            isWidgetHeader={true}
            handleNameChange={handleNameChange}
            cardExpandedMasterToggle={appState?.cardExpandedMasterToggle}
          />

          {friendRequests?.length > 0 && (
            <FriendRequestsAccordion
              getConversations={getConversations}
              friendRequests={friendRequests}
              getFriends={getFriends} // To refresh friends list after accepting a friend request
              getFriendRequests={getFriendRequests} // Same thing here
              // cardExpandedMasterToggle={appState?.cardExpandedMasterToggle}
              acceptFriendRequest={acceptFriendRequest}
            />
          )}
        </div>
        <div style={{ overflowY: 'auto', scrollbarGutter: 'stable' }}>
          {appState?.findFriendsSearchValue
            ? filteredFriends?.map((friend, index) => (
                <AccordionItem
                  key={index}
                  friend={friend}
                  isMe={friend._id === currentUser?._id}
                  cardExpandedMasterToggle={appState?.cardExpandedMasterToggle}
                />
              ))
            : friends.length
            ? friends.map((friend, index) => (
                <AccordionItem
                  key={index}
                  friend={friend}
                  isMe={friend._id === currentUser?._id}
                  cardExpandedMasterToggle={appState?.cardExpandedMasterToggle}
                />
              ))
            : null}
        </div>

        <EmptySpaceFiller />
        <div style={{ flex: '0 1 40px' }}>
          <WidgetFooter
            handleSearchInput={handleSearchInput}
            searchValue={appState?.findFriendsSearchValue}
            friends={friends}
          />
        </div>
      </div>
      <svg
        id="svg"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          height: '100%',
          width: '100%',
          position: 'fixed',
          top: '0px',
          left: '0px',
          right: '0px',
          bottom: '0px',
          pointerEvents: 'none',
          zIndex: 90,
        }}
      >
        <defs>
          <filter id="noise" y="0" x="0">
            <feTurbulence
              class="basefrequency"
              stitchTiles="stitch"
              baseFrequency=".75"
              type="fractalNoise"
            />
          </filter>
          <pattern
            id="pattern"
            class="tile1"
            patternUnits="userSpaceOnUse"
            height="100"
            width="100"
            y="0"
            x="0"
          >
            <rect
              class="bg"
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="transparent"
            />
            <rect
              class="opacity"
              x="0"
              y="0"
              width="100%"
              height="100%"
              filter="url(#noise)"
              opacity=".30"
            />
          </pattern>
        </defs>
        <rect
          style={{ pointerEvents: 'none' }}
          id="rect"
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#pattern)"
        />
      </svg>
    </>
  );
}
