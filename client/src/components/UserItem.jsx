import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { css } from '@stitches/react';
import Avatar from 'react-avatar';

import colors from '../config/colors';
import animations from '../config/animations';

const container = css({
  flexDirection: 'row',
  display: 'flex',
  padding: 6,
});

const nameAndActivityContainer = css({
  alignSelf: 'center',
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'space-between',
});

const buttonsContainer = css({
  paddingRight: 6,
});

const text = css({
  paddingLeft: '10px',
  color: colors.darkmodeBlack,
  fontSize: '1.2em',
  letterSpacing: '1px',
  fontFamily: 'Cormorant SC',
});

const header = css({ paddingLeft: 5, paddingTop: 5, paddingBottom: 5 });

const friendRequestButtonStyle = css({
  padding: 10,
  textAlign: 'left',
  fontSize: '0.8em',
  maxWidth: '72%',
  margin: 'auto',
  color: colors.darkmodeLightBlack,
  cursor: 'pointer',
});

const cancelRequestButtonStyle = css({
  padding: 10,
  textAlign: 'left',
  fontSize: '0.8em',
  margin: 'auto',
  color: colors.darkmodeLightBlack,
  cursor: 'pointer',
});

const AcceptRejectButtonsContainer = css({
  display: 'flex',
  flexDirection: 'row',
  marginTop: -6,
  paddingRight: 4,
});

const errorStyle = css({
  fontSize: '0.9em',
  color: colors.coffeeRed,
  padding: 3,
});

const AcceptRejectButtons = ({ error, handleAccept, handleReject }) => {
  return (
    <div className={AcceptRejectButtonsContainer()}>
      {error ? (
        <div className={errorStyle()}>{error}</div>
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
            className={friendRequestButtonStyle()}
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
            className={friendRequestButtonStyle()}
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
    <div className={errorStyle()}>{error}</div>
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
      className={buttonsContainer()}
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
        className={friendRequestButtonStyle()}
        onClick={() => handleSendRequest()}
      >
        add
      </motion.div>
    </motion.div>
  );
};

export default function UserItem({
  user,
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

  useEffect(() => {
    const errorTimeout = setTimeout(() => setError(null), 3000);

    return () => clearTimeout(errorTimeout);
  }, [error]);

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
        className={header()}
      >
        <motion.div className={container()}>
          <Avatar round name={user.username} size="34" src={profilePicture} />
          <div className={nameAndActivityContainer()}>
            <div className={text()}>{user.username}</div>

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
                  <div className={errorStyle()}>{error}</div>
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
                    className={cancelRequestButtonStyle()}
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
