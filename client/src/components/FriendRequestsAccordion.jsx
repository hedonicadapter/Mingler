import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { css } from '@stitches/react';

import CardHeader from './CardHeader';
import CardBody from './CardBody';
import colors from '../config/colors';
import UserItem from './UserItem';
import { useAuth } from '../contexts/AuthContext';
import { useLocalStorage } from '../helpers/localStorageManager';
import DAO from '../config/DAO';
import { cancelFriendRequest } from '../config/socket';

const generalPadding = 12;

const header = css({
  alignSelf: 'center',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  padding: generalPadding,

  fontSize: '1em',

  zIndex: 5,
});

export default function FriendRequestsAccordion({
  friendRequests,
  getFriends,
  getFriendRequests,
}) {
  const { currentUser, token } = useAuth();

  const [expanded, setExpanded] = useState(false);

  const hasRequests = friendRequests?.length > 0;

  const toggleExpansion = () => {
    if (hasRequests) {
      setExpanded(!expanded);
    }
  };

  const handleAcceptRequestButton = (fromID) => {
    DAO.acceptFriendRequest(fromID, currentUser._id, token)
      .then((res) => {
        // Refresh friends list
        getFriends();
        getFriendRequests();
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const handleRejectRequestButton = (toID) => {
    DAO.cancelFriendRequest(currentUser._id, toID, token)
      .then((res) => {
        getFriendRequests();
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <>
      <motion.header
        // user.offline ? 'transparent'
        style={{
          backgroundColor: expanded
            ? 'rgba(241,235,232,1)'
            : 'rgba(253,245,241, 1)',
          color: hasRequests
            ? colors.darkmodeBlack
            : colors.darkmodeDisabledText,
          fontWeight: hasRequests ? 'normal' : '700',
        }}
        whileHover={{
          backgroundColor: 'rgba(241,235,232,1)',
        }}
        transition={{ duration: 0.15 }}
        onClick={() => toggleExpansion()}
        className={header()}
      >
        <span>Friend requests</span>
        <span>{friendRequests?.length}</span>
      </motion.header>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.section
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { height: 'auto', color: 'rgba(0,0,0,1)' },
              collapsed: { height: 0, color: 'rgba(0,0,0,0)' },
            }}
            transition={{ duration: 0.15, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <motion.div
              variants={{
                open: { marginTop: 0 },
                collapsed: { marginTop: -40 },
              }}
            >
              {friendRequests.map((user) => (
                <div
                  style={{
                    padding: generalPadding,
                    backgroundColor: colors.depressedWhite,
                  }}
                >
                  <UserItem
                    user={user}
                    accept={true}
                    handleAcceptRequestButton={handleAcceptRequestButton}
                    handleRejectRequestButton={handleRejectRequestButton}
                  />
                </div>
              ))}
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
