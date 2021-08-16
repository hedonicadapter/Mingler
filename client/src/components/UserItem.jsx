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
  opacity: 0,
  fontSize: '0.9em',
  fontWeight: 700,
  color: colors.darkmodeDisabledText,
  padding: 3,
  borderRadius: 3,
  border: '2px solid',
  borderColor: colors.darkmodeDisabledText,
});

const hoverAnimation = {
  color: 'rgba(100, 245, 141, 1)',
  borderColor: 'rgba(100, 245, 141, 1)',
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
  requestSent,
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
                whileHover={hoverAnimation}
                whileTap={tapAnimation}
                className={friendRequestButtonStyle()}
                style={{
                  transition: 'opacity 0.15s',
                  opacity: hovered ? 1 : 0,
                }}
                onClick={() => handleFriendRequestButton(user._id)}
              >
                Add
              </motion.div>
            ) : (
              <div>Request sent</div>
            )}
          </div>
        </motion.div>
      </header>
    </motion.div>
  );
}
