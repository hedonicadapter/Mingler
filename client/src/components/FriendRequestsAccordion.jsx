import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import styles from './FriendRequestsAccordion.module.css';
import colors from '../config/colors';
import UserItem from './UserItem';
import { useLocalStorage } from '../helpers/localStorageManager';
import DAO from '../config/DAO';
import { useSelector } from 'react-redux';
import { getCurrentUser } from '../mainState/features/settingsSlice';
import genericErrorHandler from '../helpers/genericErrorHandler';

const generalPadding = 12;

export default function FriendRequestsAccordion({
  friendRequests,
  getFriends,
  getConversations,
  getFriendRequests,
  acceptFriendRequest,
}) {
  const currentUser = useSelector((state) => getCurrentUser(state));

  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(null);

  const hasRequests = friendRequests?.length > 0;

  useEffect(() => {
    const errorTimeout = setTimeout(() => setError(null), 3000);

    return () => clearTimeout(errorTimeout);
  }, [error]);

  const toggleExpansion = () => {
    if (hasRequests) {
      setExpanded(!expanded);
    }
  };

  const handleAcceptRequestButton = async (fromID) => {
    return await DAO.acceptFriendRequest(
      fromID,
      currentUser._id,
      currentUser.accessToken
    )
      .then((res) => {
        if (res?.data?.success) {
          // Refresh friends list
          getFriends();
          getConversations();
          getFriendRequests();
          acceptFriendRequest(fromID);
          return { success: true };
        }
      })
      .catch(genericErrorHandler);
  };

  const handleRejectRequestButton = async (toID) => {
    return await DAO.cancelFriendRequest(
      currentUser._id,
      toID,
      currentUser.accessToken
    )
      .then((res) => {
        if (res?.data?.success) {
          // Refresh
          getFriendRequests();
          return { success: true };
        }
      })
      .catch(genericErrorHandler);
  };

  return (
    <>
      <motion.header
        style={{
          backgroundColor: expanded ? colors.offWhiteHovered : colors.offWhite,
          color: expanded
            ? colors.darkmodeBlack
            : hasRequests
            ? colors.defaultPlaceholderTextColor
            : colors.darkmodeDisabledBlack,
          fontWeight: hasRequests ? 'normal' : '700',
        }}
        whileHover={{
          color: colors.darkmodeBlack,
          cursor: hasRequests ? 'pointer' : 'auto',
        }}
        transition={{ duration: 0.15 }}
        onClick={() => toggleExpansion()}
        className={styles.header}
      >
        <span>friend requests</span>
        <span style={{ fontSize: '0.8em', padding: 3, paddingRight: 0 }}>
          {friendRequests?.length}
        </span>
      </motion.header>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.section
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { height: 'auto', color: colors.darkmodeBlack },
              collapsed: { height: 0, color: 'rgba(0,0,0,0)' },
            }}
            transition={{ duration: 0.15, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            {friendRequests.map((user, index) => (
              <div
                key={index}
                style={{
                  padding: generalPadding,
                  backgroundColor: colors.offWhiteHovered,
                }}
              >
                <UserItem
                  user={user}
                  accept={true}
                  handleAcceptRequestButton={handleAcceptRequestButton}
                  handleRejectRequestButton={handleRejectRequestButton}
                  index={0}
                />
              </div>
            ))}
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
