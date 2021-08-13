import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { css } from '@stitches/react';
import Avatar from 'react-avatar';

import CardHeader from './CardHeader';
import colors from '../config/colors';

const container = css({
  backgroundColor: 'transparent',
  flexDirection: 'row',
  display: 'flex',
  paddingLeft: 35,
  paddingTop: 10,
  paddingBottom: 10,
  // marginTop: 10,
  // borderTop: '1.5px solid',
  // borderTopColor: colors.darkmodeBlack,
});

const nameAndActivityContainer = css({
  flexDirection: 'column',
  width: '80%',
});
const text = css({
  paddingLeft: '7px',
  color: colors.darkmodeBlack,
  fontSize: '1.2em',
});

const header = css({});
const avatar = css({});

const statusIndicatorContainer = css({
  position: 'absolute',
  // marginTop: -25,
});

const nameAndActivityPadding = css({
  paddingLeft: 2,
});

export default function UserItem({ user }) {
  return (
    <>
      <motion.header
        style={{
          backgroundColor: 'rgba(253,245,241, 1)',
        }}
        whileHover={{
          backgroundColor: 'rgba(241,235,232,1)',
        }}
        transition={{ duration: 0.15 }}
        onClick={() => toggleExpansion()}
        className={header()}
      >
        <motion.div className={container()}>
          <Avatar round className={avatar()} name={user?.username} size="50" />
          <div className={nameAndActivityContainer()}>
            <div className={text()}>{user?.username}</div>
            <div className={statusIndicatorContainer()}></div>
            <div className={nameAndActivityPadding()}>
              {/* add or remove buttons */}
            </div>
          </div>
        </motion.div>
      </motion.header>
    </>
  );
}
