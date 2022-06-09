import React, { useState, useEffect, useRef } from 'react';
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
} from '../mainState/features/appSlice';

const container = css({
  display: 'flex',
  flexFlow: 'column',
  height: '100vh',
  pointerEvents: 'auto',
  backgroundColor: 'transparent',
});

const EmptySpaceFiller = ({
  setExpandedMasterToggle,
  expandedMasterToggle,
}) => {
  return (
    <div
      style={{ flex: '1 1 auto', backgroundColor: colors.offWhite, zIndex: 60 }}
      onClick={() => setExpandedMasterToggle(!expandedMasterToggle)}
    />
  );
};

export default function FriendsList() {
  const dispatch = useDispatch();

  const currentUser = useSelector(getCurrentUser);
  const appState = useSelector(getApp);

  const { socket } = useClientSocket();
  const {
    friends,
    getFriends,
    findFriends,
    filteredFriends,
    getFriendRequests,
    friendRequests,
  } = useFriends();

  const [expandedMasterToggle, setExpandedMasterToggle] = useState(false);

  const handleSearchInput = (evt) => {
    let searchValue = evt.target.value;
    dispatch(setFindFriendsSearchValue(searchValue));

    findFriends(searchValue);
  };

  const handleNameChange = (evt) => {
    setUserName(evt.target.value);
    setName(evt.target.value);
  };

  // useEffect(() => {
  //   if (friends && socket) {
  //     setActivityListeners();
  //   }
  // }, [friends, socket]);

  return (
    <>
      <MenuButton />
      <div className={container()} spellCheck="false">
        <div style={{ flex: '0 1 auto' }}>
          <AccordionItem
            username={currentUser?.username}
            friend={friends?.find((friend) => friend._id === currentUser?._id)}
            isWidgetHeader={true}
            handleNameChange={handleNameChange}
          />

          {friendRequests?.length > 0 && (
            <FriendRequestsAccordion
              friendRequests={friendRequests}
              getFriends={getFriends} // To refresh friends list after accepting a friend request
              getFriendRequests={getFriendRequests} // Same thing here
              expandedMasterToggle={expandedMasterToggle}
            />
          )}

          {appState?.findFriendsSearchValue
            ? filteredFriends?.map((friend, index) => (
                <AccordionItem
                  key={index}
                  friend={friend}
                  expandedMasterToggle={expandedMasterToggle}
                />
              ))
            : friends.length
            ? friends.map((friend, index) => (
                <AccordionItem
                  key={index}
                  friend={friend}
                  expandedMasterToggle={expandedMasterToggle}
                />
              ))
            : null}
        </div>
        <EmptySpaceFiller
          setExpandedMasterToggle={setExpandedMasterToggle}
          expandedMasterToggle={expandedMasterToggle}
        />
        <WidgetFooter
          handleSearchInput={handleSearchInput}
          searchValue={appState?.findFriendsSearchValue}
          friends={friends}
        />
      </div>
    </>
  );
}
