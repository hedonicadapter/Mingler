import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AccordionItem.module.css';

import { BiConversation } from 'react-icons/bi';

import CardHeader from './CardHeader';
import CardBody from './CardBody';
import colors from '../config/colors';
import { useFriends } from '../contexts/FriendsContext';
import { getRandomPositiveNumber } from '../helpers/useFakeActivities';

const ipcRenderer = require('electron').ipcRenderer;

const CardSeparator = ({ cardHovered, expanded }) => {
  return (
    <div className={styles.separatorContainer}>
      <div
        className={styles.separator}
        style={{
          opacity: cardHovered ? (expanded ? 0 : 1) : 0,
        }}
      />
    </div>
  );
};

function AccordionItem({
  activities,
  clientDemoUser,
  username,
  friend,
  isMe,
  isWidgetHeader,
  cardExpandedMasterToggle,
}) {
  const isDefaultDemoFriend = clientDemoUser?.demoDefaultFriendIDs.includes(
    friend?._id
  );

  const cardHeaderRef = useRef(null);
  const cardBodyRef = useRef(null);
  const reactPlayerRef = useRef(null);

  const { deleteFriend } = useFriends();

  const [expanded, setExpanded] = useState(false);
  const [cardHovered, setCardHovered] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [playerVisible, setPlayerVisible] = useState(false);
  const [playerURL, setPlayerURL] = useState(null);
  const [activityLength, setActivityLength] = useState(null);
  const [online, setOnline] = useState();

  useEffect(() => {
    if (!chatVisible && !playerVisible) return;

    cardBodyRef?.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [expanded]);

  useEffect(() => {
    if (expanded) return;
    setChatVisible(false);
    setPlayerVisible(false);
  }, [expanded]);

  // Set random online/offline statuses for demo account default friends
  useEffect(() => {
    let timeouts = [];

    if (isDefaultDemoFriend) {
      let fiveHours = 18000000;
      let fiveMinutes = 300000;
      let randomBoolean = Math.random() < 0.5;
      setOnline(randomBoolean);

      // random time between five hours and five minutes for user to be online or offline
      // If they're online already, use a bigger range so there's more online than offline
      let randomOnlineTime = online
        ? getRandomPositiveNumber(fiveHours, fiveMinutes)
        : getRandomPositiveNumber(fiveMinutes, 1);

      const statusTimeout = setTimeout(
        () => setOnline(!online),
        randomOnlineTime
      );

      timeouts.push(statusTimeout);
    } else setOnline(friend?.online);

    return () => timeouts.forEach(clearTimeout);
  }, [online]);

  useEffect(() => {
    ipcRenderer.on('context-menu:delete', contextMenuDeleteFriendHandler);

    return () => {
      ipcRenderer.removeAllListeners(
        'context-menu:delete',
        contextMenuDeleteFriendHandler
      );
    };
  }, []);

  useEffect(() => {
    activities && setActivityLength(activities.length);
    console.log({ activities });
  }, [activities]);

  useEffect(() => {
    setExpanded(false);
    setPlayerVisible(false);
    setChatVisible(false);
  }, [cardExpandedMasterToggle]);

  const handleOnContextMenu = (evt) => {
    if (isMe || isWidgetHeader) {
      evt.stopPropagation();
      ipcRenderer.send('context-menu');
    } else if (friend?.username && friend?._id) {
      evt.stopPropagation();
      ipcRenderer.send('context-menu', {
        username: friend.username,
        friendID: friend._id,
      });
    }
  };

  const toggleExpansion = (evt) => {
    evt?.stopPropagation();
    setExpanded(!expanded);
  };

  const toggleChat = (e) => {
    e.stopPropagation();
    setChatVisible(!chatVisible);

    if (!expanded) {
      toggleExpansion();
    }
  };

  const togglePlayer = () => {
    setPlayerVisible(!playerVisible);

    if (!expanded) {
      toggleExpansion();
    }
  };

  const closePlayer = () => {
    setPlayerVisible(false);
  };

  const contextMenuDeleteFriendHandler = (e, { menuItem, friendID }) => {
    if (menuItem === 'deleteFriend') {
      deleteFriend(friendID);
    }
  };

  return (
    <div onContextMenu={handleOnContextMenu}>
      <div
        style={{
          position: 'relative',
          minHeight: 86,
          transition: 'background-color 0.1s linear',
          backgroundColor: expanded ? colors.offWhiteHovered : colors.offWhite,
          WebkitMask: isWidgetHeader
            ? 'none'
            : !online &&
              !isMe &&
              'radial-gradient(circle 9px at 36px 50%,transparent 88%,#fff)',
          // backgroundColor: expanded
          //   ? colors.offWhite //used to be rgba(241,235,232,1)
          //   : 'rgba(36,36,36,0)', //transparent used to be rgba(253,245,241, 1)
          paddingLeft: isWidgetHeader ? 32 : 54,
          paddingTop: isWidgetHeader ? 35 : 25,
          // paddingBottom: expanded ? 24 : 0,
        }}
        onClick={toggleExpansion}
        className={styles.header}
        onMouseEnter={() => setCardHovered(true)}
        onMouseLeave={() => setCardHovered(false)}
      >
        <div
          style={{
            transition: 'opacity 0.5s ease',
            opacity: online || isMe || isWidgetHeader ? 1 : 0.4,
          }}
        >
          <CardHeader
            clientDemoUser={clientDemoUser} // this client's own assigned demo user
            demoUser={friend?.demoUser} // boolean is friend a demo user or not
            activityLength={activityLength}
            playerVisible={playerVisible}
            playerURL={playerURL}
            setPlayerURL={setPlayerURL}
            reactPlayerRef={reactPlayerRef.current}
            togglePlayer={togglePlayer}
            cardHeaderRef={cardHeaderRef}
            online={online}
            key={friend?.key}
            name={username ? username : friend?.username}
            profilePicture={friend?.profilePicture}
            userID={friend?._id}
            activities={activities}
            expanded={expanded}
            chatVisible={chatVisible}
            isWidgetHeader={isWidgetHeader}
            isMe={isMe}
            cardHovered={cardHovered}
          />

          {!isWidgetHeader && (
            <AnimatePresence>
              {cardHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    style={{
                      cursor: 'pointer',
                      position: 'absolute',
                      right: 16,
                      top: '25%',
                      bottom: '75%',
                      float: 'right',
                      verticalAlign: 'middle',
                      lineHeight: '100%',
                    }}
                    onClick={(e) => toggleChat(e)}
                  >
                    <BiConversation
                      style={{
                        color: expanded
                          ? chatVisible
                            ? colors.darkmodeLightBlack
                            : colors.darkmodeBlack
                          : colors.darkmodeBlack,
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
      <CardSeparator cardHovered={cardHovered} expanded={expanded} />

      <div ref={cardBodyRef}>
        <CardBody
          userID={friend?._id}
          expanded={expanded}
          chatVisible={chatVisible}
          playerURL={playerURL}
          reactPlayerRef={reactPlayerRef}
          playerVisible={playerVisible}
          closePlayer={closePlayer}
          isWidgetHeader={isWidgetHeader}
        />
      </div>
    </div>
  );
}

export default React.memo(AccordionItem);
