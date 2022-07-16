import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AccordionItem.module.css';

import { BiConversation } from 'react-icons/bi';

import CardHeader from './CardHeader';
import CardBody from './CardBody';
import colors from '../config/colors';
import { useFriends } from '../contexts/FriendsContext';

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

export default function AccordionItem({
  username,
  friend,
  isMe,
  isWidgetHeader,
  cardExpandedMasterToggle,
}) {
  const { deleteFriend } = useFriends();

  const [expanded, setExpanded] = useState(false);
  const [cardHovered, setCardHovered] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [playerVisible, setPlayerVisible] = useState(false);
  const [playerURL, setPlayerURL] = useState(null);
  const [activityLength, setActivityLength] = useState(null);

  const cardHeaderRef = useRef(null);

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
    setActivityLength(friend?.activity?.length);
  }, [friend]);

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
    <motion.div
      transition={{ duration: 0.15, stiffness: 100 }}
      onContextMenu={handleOnContextMenu}
    >
      <div
        style={{
          position: 'relative',
          minHeight: 86,
          transition: 'background-color 0.1s linear',
          backgroundColor: expanded ? colors.offWhiteHovered : colors.offWhite,
          WebkitMask: isWidgetHeader
            ? 'none'
            : !friend?.online &&
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
            opacity: friend?.online || isMe || isWidgetHeader ? 1 : 0.4,
          }}
        >
          <CardHeader
            activityLength={activityLength}
            togglePlayer={togglePlayer}
            setPlayerURL={setPlayerURL}
            cardHeaderRef={cardHeaderRef}
            online={friend?.online}
            key={friend?.key}
            name={username ? username : friend?.username}
            profilePicture={friend?.profilePicture}
            userID={friend?._id}
            mainActivity={friend?.activity?.[0]}
            activity={friend?.activity}
            expanded={expanded}
            chatVisible={chatVisible}
            isWidgetHeader={isWidgetHeader}
            demoUser={friend?.demoUser}
            isMe={isMe}
            cardHovered={cardHovered}
          />

          {!isWidgetHeader && (
            <div
              style={{
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
                // className={messageIcon()}
                style={{
                  color: expanded
                    ? chatVisible
                      ? colors.darkmodeLightBlack
                      : colors.darkmodeBlack
                    : colors.darkmodeBlack,

                  opacity: cardHovered ? 0.6 : 0,
                }}
              />
            </div>
          )}
        </div>
      </div>
      <CardSeparator cardHovered={cardHovered} expanded={expanded} />

      {expanded && (
        <CardBody
          activity={friend?.activity}
          userID={friend?._id}
          expanded={expanded}
          chatVisible={chatVisible}
          playerURL={playerURL}
          playerVisible={playerVisible}
          closePlayer={closePlayer}
        />
      )}
    </motion.div>
  );
}
