import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { css } from '@stitches/react';
import Avatar from 'react-avatar';

import CardHeader from './CardHeader';
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

const header = css({});
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

export default function UserItem({
  user,
  index,
  handleFriendRequestButton,
  handleAcceptRequestButton,
  handleCancelRequestButton,
  requestSent,
  accept, // Flag to show accept or add button for each item
}) {
  const [hovered, setHovered] = useState(false);

  const alternatingColor = [colors.classyWhite, colors.depressedWhite];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="clickable"
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
            {!requestSent ? (
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
                onClick={() =>
                  accept
                    ? handleAcceptRequestButton(user._id)
                    : handleFriendRequestButton(user._id)
                }
              >
                {accept ? <>Accept</> : <>Add</>}
              </motion.div>
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
