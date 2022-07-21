import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

import styles from './ConversationBubble.module.css';
import colors from '../config/colors';
import { useSelector } from 'react-redux';
import { getCurrentUser } from '../mainState/features/settingsSlice';

export const ConversationBubble = ({ fromID, message, sent, expanded }) => {
  const currentUser = useSelector((state) => getCurrentUser(state));

  const sentByMe = fromID === currentUser?._id;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      duration={{ transition: 0.15 }}
      className={styles.bubbleContainer}
      style={{ justifyContent: sentByMe ? 'flex-end' : 'flex-start' }}
    >
      {sentByMe ? (
        <>
          <div className={styles.sentTime} style={{ paddingLeft: 2 }}>
            {new Date(sent).toLocaleTimeString('en-US', {
              timeStyle: 'short',
            })}
          </div>
          <div
            className={styles.bubble}
            style={{
              backgroundColor: colors.darkmodeLightBlack,
            }}
          >
            <p className={styles.conversationText}>{message}</p>
          </div>
        </>
      ) : (
        <>
          <div
            className={styles.bubble}
            style={{
              backgroundColor: colors.coffeeBrown,
            }}
          >
            <p className={styles.conversationText}>{message}</p>
          </div>
          <div
            className={styles.sentTime}
            style={{ padding: 0, paddingRight: 12 }}
          >
            {new Date(sent).toLocaleTimeString('en-US', {
              timeStyle: 'short',
            })}
          </div>
        </>
      )}
    </motion.div>
  );
};
