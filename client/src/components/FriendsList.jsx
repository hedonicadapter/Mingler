import React, { useState, useRef } from 'react';
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
import { useBrowserWindow } from '../contexts/BrowserWindowContext';
import useDebounce from '../helpers/useDebounce';

const container = css({
  display: 'flex',
  flexFlow: 'column',
  height: '100vh',
  pointerEvents: 'auto',
  backgroundColor: 'transparent',
});

export const EmptySpaceFiller = ({
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

  const [expandedMasterToggle, setExpandedMasterToggle] = useState(false);

  const handleSearchInput = (evt) => {
    let searchValue = evt.target.value;
    dispatch(setFindFriendsSearchValue(searchValue));
  };

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
              getConversations={getConversations}
              friendRequests={friendRequests}
              getFriends={getFriends} // To refresh friends list after accepting a friend request
              getFriendRequests={getFriendRequests} // Same thing here
              expandedMasterToggle={expandedMasterToggle}
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
                  expandedMasterToggle={expandedMasterToggle}
                  isMe={friend._id === currentUser?._id}
                />
              ))
            : friends.length
            ? friends.map((friend, index) => (
                <AccordionItem
                  key={index}
                  friend={friend}
                  expandedMasterToggle={expandedMasterToggle}
                  isMe={friend._id === currentUser?._id}
                />
              ))
            : null}
        </div>

        <EmptySpaceFiller
          setExpandedMasterToggle={setExpandedMasterToggle}
          expandedMasterToggle={expandedMasterToggle}
        />
        <div style={{ flex: '0 1 40px' }}>
          <WidgetFooter
            handleSearchInput={handleSearchInput}
            searchValue={appState?.findFriendsSearchValue}
            friends={friends}
          />
        </div>
      </div>
    </>
  );
}
