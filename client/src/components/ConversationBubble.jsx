import React, { useEffect, useState, useRef } from 'react';
import { css } from '@stitches/react';

import colors from '../config/colors';
import { useAuth } from '../contexts/AuthContext';

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
  color: colors.darkmodeDisabledWhite,
  padding: 8,
  marginInline: 5,
  fontSize: '0.6em',
});

export const ConversationBubble = ({ fromID, message, sent }) => {
  const { currentUser } = useAuth();
  const sentByMe = fromID === currentUser?._id;

  const bubbleContainer = css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 4,
    justifyContent: sentByMe ? 'flex-end' : 'flex-start',
  });
  const bubble = css({
    backgroundColor: sentByMe ? colors.nudeBloo : colors.darkmodeMediumWhite,
    borderRadius: '15px',
    marginRight: 8,
  });

  return (
    <div className={bubbleContainer()}>
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
          <div className={sentTime()}>
            {new Date(sent).toLocaleTimeString('en-US', {
              timeStyle: 'short',
            })}
          </div>
        </>
      )}
    </div>
  );
};
