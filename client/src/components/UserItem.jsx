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

const text = css({
  paddingLeft: '7px',
  color: colors.darkmodeBlack,
  fontSize: '1.2em',
});

const header = css({ paddingLeft: 5, paddingTop: 5, paddingBottom: 5 });

const friendRequestButtonStyle = css({
  // opacity: 0,
  fontSize: '0.9em',
  fontWeight: 700,
  color: colors.darkmodeDisabledText,
  padding: 3,
  borderRadius: 3,
  border: '2px solid',
  borderColor: colors.darkmodeDisabledText,
});

const cancelRequestButtonStyle = css({
  fontSize: '0.9em',
  fontWeight: 700,
  color: colors.darkmodeDisabledText,
  padding: 3,
  borderRadius: 3,
  border: '2px solid',
  borderColor: colors.darkmodeDisabledText,
});

const AcceptRejectButtonsContainer = css({
  display: 'flex',
  flexDirection: 'row',
});

const errorStyle = css({
  fontSize: '0.9em',
  color: colors.coffeeRed,
  padding: 3,
});

const friendRequestHoverAnimation = {
  color: 'rgba(100, 245, 141, 1)',
  borderColor: 'rgba(100, 245, 141, 1)',
};

const cancelRequestHoverAnimation = {
  color: colors.samDeepRed,
  borderColor: colors.samDeepRed,
};

const AcceptRejectButtons = ({ error, handleAccept, handleReject }) => {
  return (
    <div className={AcceptRejectButtonsContainer()}>
      {error ? (
        <div className={errorStyle()}>{error}</div>
      ) : (
        <>
          <motion.div
            initial={{ borderColor: 'rgba(131,133,140,1)' }}
            whileHover={friendRequestHoverAnimation}
            whileTap={animations.whileTap}
            className={friendRequestButtonStyle()}
            onClick={() => handleAccept()}
          >
            Accept
          </motion.div>
          <motion.div
            initial={{ borderColor: 'rgba(131,133,140,1)' }}
            whileHover={friendRequestHoverAnimation}
            whileTap={animations.whileTap}
            className={friendRequestButtonStyle()}
            onClick={() => handleReject()}
          >
            X
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
      initial={{ borderColor: 'rgba(131,133,140,1)' }}
      whileHover={friendRequestHoverAnimation}
      whileTap={animations.whileTap}
      className={friendRequestButtonStyle()}
      style={
        !accept && {
          transition: 'opacity 0.15s',
          opacity: hovered ? 1 : 0,
        }
      }
      onClick={() => handleSendRequest()}
    >
      Add
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
                    initial={{ borderColor: 'rgba(131,133,140,1)' }}
                    whileHover={cancelRequestHoverAnimation}
                    whileTap={animations.whileTap}
                    className={cancelRequestButtonStyle()}
                  >
                    Cancel request
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
