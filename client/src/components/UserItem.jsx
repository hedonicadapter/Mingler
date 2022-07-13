import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from 'react-avatar';

import styles from './UserItem.module.css';
import colors from '../config/colors';
import animations from '../config/animations';
import {
  profilePictureToBlob,
  profilePictureToJSXImg,
} from '../helpers/fileManager';

const AcceptRejectButtons = ({ error, handleAccept, handleReject }) => {
  return (
    <div className={styles.AcceptRejectButtonsContainer}>
      {error ? (
        <div className={styles.errorStyle}>{error}</div>
      ) : (
        <>
          <motion.div
            whileHover={{
              borderTopColor: colors.darkmodeBlack,
              transition: { duration: 0.1 },
            }}
            whileTap={animations.whileTap}
            style={{
              borderTop: '1px solid ' + colors.offWhitePressed2,
              margin: 'auto',
            }}
            className={styles.friendRequestButtonStyle}
            onClick={() => handleAccept()}
          >
            accept
          </motion.div>
          <motion.div
            whileHover={{
              borderTopColor: colors.coffeeRed,
              color: colors.coffeeRed,
              transition: { duration: 0.1 },
            }}
            whileTap={animations.whileTap}
            style={{
              borderTop: '1px solid ' + colors.offWhitePressed2,
              margin: 'auto',
            }}
            className={styles.friendRequestButtonStyle}
            onClick={() => handleReject()}
          >
            x
          </motion.div>
        </>
      )}
    </div>
  );
};

const AddButton = ({ error, handleSendRequest, accept, hovered }) => {
  return error ? (
    <div className={styles.errorStyle}>{error}</div>
  ) : (
    <motion.div
      variants={{
        true: {
          opacity: 1,
        },
        false: {
          opacity: 0,
        },
      }}
      animate={hovered ? 'true' : 'false'}
      transition={{ duration: 0.15 }}
      className={styles.buttonsContainer}
    >
      <motion.div
        whileHover={{
          borderTopColor: colors.darkmodeBlack,
          transition: { duration: 0.1 },
        }}
        whileTap={animations.whileTap}
        style={{
          borderTop: '1px solid ' + colors.offWhitePressed2,
          margin: 'auto',
        }}
        className={styles.friendRequestButtonStyle}
        onClick={() => handleSendRequest()}
      >
        add
      </motion.div>
    </motion.div>
  );
};

export default function UserItem({
  user,
  findFriendsContent,
  profilePicture,
  index,
  alreadyFriends,
  handleSendRequestButton,
  handleAcceptRequestButton,
  handleRejectRequestButton,
  handleCancelRequestButton,
  requestSent,
  accept, // Flag to show accept or add button for each item
}) {
  const [hovered, setHovered] = useState(false);
  const [error, setError] = useState(null);

  const pic =
    user?.profilePicture && findFriendsContent // It sucks I do this but I have absolutely no idea why the images don't load in findfriendscontent by just using the else clause here
      ? `data:${user?.profilePicture?.mimetype || 'image/*'};base64,${
          user?.profilePicture.image
        }`
      : profilePictureToJSXImg(user?.profilePicture);

  useEffect(() => {
    const errorTimeout = setTimeout(() => setError(null), 3000);

    return () => clearTimeout(errorTimeout);
  }, [error]);

  useEffect(() => {
    if (user.profilePicture) {
      // process.stdout.write(JSON.stringify(user?.profilePicture) + '\n');
    }
  }, [user]);

  const errorCallback = ({ success, error }) => {
    if (success) {
      setError(null);
    }
    if (error) {
      setError(error);
    }
  };

  const handleAccept = () => {
    handleAcceptRequestButton(user._id)
      .then(errorCallback)
      .catch(console.error);
  };

  const handleReject = () => {
    handleRejectRequestButton(user._id)
      .then(errorCallback)
      .catch(console.error);
  };

  const handleSendRequest = () => {
    handleSendRequestButton(user._id).then(errorCallback).catch(console.error);
  };

  const handleCancelRequest = () => {
    handleCancelRequestButton(user._id)
      .then(errorCallback)
      .catch(console.error);
  };

  const alternatingColor = [colors.offWhiteHovered, colors.offWhite];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="clickable"
      style={{ backgroundColor: colors.offWhite }}
    >
      <header
        style={{
          backgroundColor: alternatingColor[index % alternatingColor.length],
        }}
        className={styles.header}
      >
        <motion.div className={styles.container}>
          <Avatar round name={user.username} size="34" src={pic} />
          <div className={styles.nameAndActivityContainer}>
            <div className={styles.text}>{user.username}</div>

            {alreadyFriends ? (
              <></>
            ) : !requestSent ? (
              accept ? (
                <AcceptRejectButtons
                  error={error}
                  handleAccept={handleAccept}
                  handleReject={handleReject}
                />
              ) : (
                <AddButton
                  error={error}
                  hovered={hovered}
                  accept={accept}
                  handleSendRequest={handleSendRequest}
                />
              )
            ) : (
              <div onClick={() => handleCancelRequest()}>
                {error ? (
                  <div className={styles.errorStyle}>{error}</div>
                ) : (
                  <motion.div
                    whileHover={{
                      borderTopColor: colors.coffeeRed,
                      color: colors.coffeeRed,
                      transition: { duration: 0.1 },
                    }}
                    whileTap={animations.whileTap}
                    style={{
                      borderTop: '1px solid ' + colors.offWhitePressed2,
                      margin: 'auto',
                    }}
                    className={styles.cancelRequestButtonStyle}
                  >
                    cancel request
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </header>
    </motion.div>
  );
}
