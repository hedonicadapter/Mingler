import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { css } from '@stitches/react';
import Avatar from 'react-avatar';

import colors from '../config/colors';

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
const avatar = css({});

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

const friendRequestHoverAnimation = {
  color: 'rgba(100, 245, 141, 1)',
  borderColor: 'rgba(100, 245, 141, 1)',
};

const cancelRequestHoverAnimation = {
  color: colors.samDeepRed,
  borderColor: colors.samDeepRed,
};

const tapAnimation = {
  opacity: 0.3,
  transition: {
    duration: 0.15,
  },
};

const AcceptRejectButtons = ({
  handleAcceptRequestButton,
  handleRejectRequestButton,
  userID,
}) => {
  return (
    <div className={AcceptRejectButtonsContainer()}>
      <motion.div
        initial={{ borderColor: 'rgba(131,133,140,1)' }}
        whileHover={friendRequestHoverAnimation}
        whileTap={tapAnimation}
        className={friendRequestButtonStyle()}
        onClick={() => handleAcceptRequestButton(userID)}
      >
        Accept
      </motion.div>
      <motion.div
        initial={{ borderColor: 'rgba(131,133,140,1)' }}
        whileHover={friendRequestHoverAnimation}
        whileTap={tapAnimation}
        className={friendRequestButtonStyle()}
        onClick={() => handleRejectRequestButton(userID)}
      >
        X
      </motion.div>
    </div>
  );
};

const AddButton = ({ handleSendRequestButton, userID, accept, hovered }) => {
  return (
    <motion.div
      initial={{ borderColor: 'rgba(131,133,140,1)' }}
      whileHover={friendRequestHoverAnimation}
      whileTap={tapAnimation}
      className={friendRequestButtonStyle()}
      style={
        !accept && {
          transition: 'opacity 0.15s',
          opacity: hovered ? 1 : 0,
        }
      }
      onClick={() => handleSendRequestButton(userID)}
    >
      Add
    </motion.div>
  );
};

export default function UserItem({
  user,
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

  const alternatingColor = [colors.offWhiteHovered, colors.offWhite];

  useEffect(() => {
    console.log('alreadyFriends ', user);
  }, [user]);

  useEffect(() => {
    console.log('alreadyFriends ', user._id, ' ', alreadyFriends);
  }, [alreadyFriends]);

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
          <Avatar round className={avatar()} name={user.username} size="34" />
          <div className={nameAndActivityContainer()}>
            <div className={text()}>{user.username}</div>
            {alreadyFriends ? (
              <></>
            ) : !requestSent ? (
              accept ? (
                <AcceptRejectButtons
                  handleAcceptRequestButton={handleAcceptRequestButton}
                  handleRejectRequestButton={handleRejectRequestButton}
                  userID={user._id}
                />
              ) : (
                <AddButton
                  hovered={hovered}
                  accept={accept}
                  handleSendRequestButton={handleSendRequestButton}
                  userID={user._id}
                />
              )
            ) : (
              <motion.div
                initial={{ borderColor: 'rgba(131,133,140,1)' }}
                whileHover={cancelRequestHoverAnimation}
                whileTap={tapAnimation}
                className={cancelRequestButtonStyle()}
                onClick={() => handleCancelRequestButton(user._id)}
              >
                Cancel request
              </motion.div>
            )}
          </div>
        </motion.div>
      </header>
    </motion.div>
  );
}
