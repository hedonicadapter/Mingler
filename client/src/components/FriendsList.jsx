import React, { useState, useRef, useEffect } from 'react';

import '../App.global.css';
import styles from './FriendsList.module.css';
import { AnimatePresence, AnimateSharedLayout, motion } from 'framer-motion';

import AccordionItem from './AccordionItem';
import colors from '../config/colors';
import FriendRequestsAccordion from './FriendRequestsAccordion';
import { useClientSocket } from '../contexts/ClientSocketContext';
import { useFriends } from '../contexts/FriendsContext';
import { useDispatch, useSelector } from 'react-redux';
import {
  getActivities,
  getCurrentUser,
} from '../mainState/features/settingsSlice';
import WidgetFooter from './WidgetFooter';
import MenuButton from './MenuButton';
import {
  getApp,
  setFindFriendsSearchValue,
  toggleCardExpandedMasterToggle,
} from '../mainState/features/appSlice';
import useDebounce from '../helpers/useDebounce';
import { makeClickthrough } from '../config/clickthrough';
import { ipcRenderer } from 'electron';
import { useAuth } from '../contexts/AuthContext';
import { ConfigProvider } from 'react-avatar';
import { LoadingAnimation } from './reusables/LoadingAnimation';

export const EmptySpaceFiller = () => {
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
      onClick={() => {
        contextMenuCollapseAllHandler();
      }}
    >
      <div
        style={{
          marginTop: -15,
          width: '100%',
          opacity: 0.5,
          background: `linear-gradient(to top, ${colors.offWhite} 5%, transparent)`,
          position: 'absolute',
          '&:after': { content: '' },
          height: 15,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export const BackgroundNoise = () => (
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
          className="basefrequency"
          stitchTiles="stitch"
          baseFrequency=".75"
          type="fractalNoise"
        />
      </filter>
      <pattern
        id="pattern"
        className="tile1"
        patternUnits="userSpaceOnUse"
        height="100"
        width="100"
        y="0"
        x="0"
      >
        <rect
          className="bg"
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="transparent"
        />
        <rect
          className="opacity"
          x="0"
          y="0"
          width="100%"
          height="100%"
          filter="url(#noise)"
          opacity=".32"
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
);

function FriendsList() {
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

  const [greeting, setGreeting] = useState(true);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const currentUser = useSelector(getCurrentUser);
  const activities = useSelector(getActivities);
  const appState = useSelector(getApp);

  const { acceptFriendRequest } = useClientSocket();
  const {
    friends,
    getFriends,
    getConversations,
    findFriends,
    filteredFriends,
    getFriendRequests,
    setFriendRequests,
    friendRequests,
  } = useFriends();
  const { demoUser } = useAuth();

  const handleSearchInput = (evt) => {
    let searchValue = evt.target.value;
    dispatch(setFindFriendsSearchValue(searchValue));
  };

  // TODO: react 18 - replace with useDeferredValue
  useDebounce(
    () => {
      findFriends(appState?.findFriendsSearchValue);
      setLoading(false);
    },
    750,
    [appState?.findFriendsSearchValue]
  );

  useEffect(() => {
    if (!appState?.findFriendsSearchValue) return;

    setLoading(true);
  }, [appState?.findFriendsSearchValue]);

  let timeout;
  const loadListener = () => {
    console.log('loadlistener: ', document.readyState);
    if (document.readyState === 'complete')
      timeout = setTimeout(() => setGreeting(false), 500);
  };

  useEffect(() => {
    // Check if the page has already loaded
    if (document.readyState === 'complete') {
      timeout = setTimeout(() => setGreeting(false), 500);
    } else {
      window.addEventListener('load', loadListener);
      return () => {
        clearTimeout(timeout);
        window.removeEventListener('load', loadListener);
      };
    }

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {greeting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, staggerChildren: 0.15 }}
            style={{
              zIndex: 80,
              position: 'absolute',
              height: '100vh',
              width: '100%',
              textAlign: 'center',
              backgroundColor: colors.offWhite,
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'relative',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              Good to see you.
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ConfigProvider
        colors={[
          colors.coffeeBeige,
          colors.coffeeBlue,
          colors.coffeeBrown,
          colors.coffeeGreen,
          colors.coffeeOrange,
          colors.coffeePink,
          colors.coffeeRed,
        ]}
      >
        <div
          onContextMenu={() => ipcRenderer.send('context-menu')}
          className={styles.container}
          spellCheck="false"
        >
          <div style={{ flex: '0 1 auto' }}>
            <AccordionItem
              username={currentUser?.username}
              friend={friends?.find(
                (friend) => friend._id === currentUser?._id
              )}
              activities={activities?.[currentUser?._id]}
              isWidgetHeader={true}
              cardExpandedMasterToggle={appState?.cardExpandedMasterToggle}
            />

            {friendRequests?.length > 0 && (
              <FriendRequestsAccordion
                getConversations={getConversations}
                friendRequests={friendRequests}
                getFriends={getFriends} // To refresh friends list after accepting a friend request
                getFriendRequests={getFriendRequests} // Same thing here
                setFriendRequests={setFriendRequests}
                // cardExpandedMasterToggle={appState?.cardExpandedMasterToggle}
                acceptFriendRequest={acceptFriendRequest}
              />
            )}
          </div>
          <div
            className={styles.friendsList}
            style={{ overflowY: 'overlay', scrollbarGutter: 'stable' }}
          >
            <LoadingAnimation
              style={{
                position: 'relative',
                zIndex: 100,
                left: '50%',
                top: '50%',
                width: 100,
                height: 100,
                opacity: 0.6,
              }}
              formFilled={loading ? 'loading' : false}
            />

            <AnimateSharedLayout>
              <motion.div
                layout="position"
                transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
              >
                {appState?.findFriendsSearchValue
                  ? filteredFriends?.map((friend, index) => (
                      <motion.div key={friend?._id}>
                        <AccordionItem
                          activities={activities?.[friend?._id]}
                          clientDemoUser={demoUser}
                          friend={friend}
                          isMe={friend?._id === currentUser?._id}
                          cardExpandedMasterToggle={
                            appState?.cardExpandedMasterToggle
                          }
                        />
                      </motion.div>
                    ))
                  : friends.length
                  ? friends.map((friend, index) => (
                      <motion.div key={friend?._id}>
                        <AccordionItem
                          activities={activities?.[friend?._id]}
                          clientDemoUser={demoUser}
                          friend={friend}
                          isMe={friend?._id === currentUser?._id}
                          cardExpandedMasterToggle={
                            appState?.cardExpandedMasterToggle
                          }
                        />
                      </motion.div>
                    ))
                  : null}
              </motion.div>
            </AnimateSharedLayout>
          </div>

          <EmptySpaceFiller />

          <div style={{ flex: '0 1 40px' }}>
            <WidgetFooter
              appVisible={appState?.appVisible}
              handleSearchInput={handleSearchInput}
              searchValue={appState?.findFriendsSearchValue}
              friends={friends}
            />
          </div>
        </div>
      </ConfigProvider>
      <BackgroundNoise />
    </>
  );
}
export default React.memo(FriendsList);
