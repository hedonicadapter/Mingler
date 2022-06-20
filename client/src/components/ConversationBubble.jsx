import React, { useState, useRef } from 'react';
import { css } from '@stitches/react';
import { motion } from 'framer-motion';

import colors from '../config/colors';
import { useSelector } from 'react-redux';
import { getCurrentUser } from '../mainState/features/settingsSlice';

const conversationText = css({
  margin: 0,
  padding: 10,
  maxWidth: '100%',
  wordWrap: 'break-all',
  whiteSpace: 'break-spaces',
  textOverflow: ' ',
  fontSize: '0.8em',
});
const sentTime = css({
  color: colors.darkmodeLightBlack,
  padding: 8,
  marginInline: 3,
  fontSize: '0.6em',
});

export const ConversationBubble = ({ fromID, message, sent, expanded }) => {
  const currentUser = useSelector((state) => getCurrentUser(state));

  const sentByMe = fromID === currentUser?._id;

  const bubbleContainer = css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 3,
    justifyContent: sentByMe ? 'flex-end' : 'flex-start',
  });
  const bubble = css({
    backgroundColor: sentByMe ? '#e6ccb2' : '#60463B',
    borderRadius: '15px',
    marginRight: 10,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      duration={{ transition: 0.15 }}
      className={bubbleContainer()}
    >
      {sentByMe ? (
        <>
          <div className={sentTime()}>
            {new Date(sent).toLocaleTimeString('en-US', {
              timeStyle: 'short',
            })}
          </div>
          <div className={bubble()}>
            <p className={conversationText()}>{message}</p>
          </div>
        </>
      ) : (
        <>
          <div className={bubble()}>
            <p className={conversationText()}>{message}</p>
          </div>
          <div className={sentTime()} style={{ padding: 0 }}>
            {new Date(sent).toLocaleTimeString('en-US', {
              timeStyle: 'short',
            })}
          </div>
        </>
      )}
    </motion.div>
  );
};
