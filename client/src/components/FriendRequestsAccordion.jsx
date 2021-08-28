import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { css } from '@stitches/react';

import CardHeader from './CardHeader';
import CardBody from './CardBody';
import colors from '../config/colors';
import UserItem from './UserItem';

const generalPadding = 12;

const header = css({
  alignSelf: 'center',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  padding: generalPadding,

  fontSize: '1em',

  zIndex: 5,
});

export default function FriendRequestsAccordion({ friendRequests }) {
  console.log('friendRequests', friendRequests);
  const [expanded, setExpanded] = useState(false);

  const hasRequests = friendRequests?.length > 0;

  const toggleExpansion = () => {
    if (hasRequests) {
      setExpanded(!expanded);
    }
  };

  return (
    <>
      <motion.header
        // user.offline ? 'transparent'
        style={{
          backgroundColor: expanded
            ? 'rgba(241,235,232,1)'
            : 'rgba(253,245,241, 1)',
          color: hasRequests
            ? colors.darkmodeBlack
            : colors.darkmodeDisabledText,
          fontWeight: hasRequests ? 'normal' : '700',
        }}
        whileHover={{
          backgroundColor: 'rgba(241,235,232,1)',
        }}
        transition={{ duration: 0.15 }}
        onClick={() => toggleExpansion()}
        className={header()}
      >
        <span>Friend requests</span>
        <span>{friendRequests?.length}</span>
      </motion.header>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.section
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { height: 'auto', color: 'rgba(0,0,0,1)' },
              collapsed: { height: 0, color: 'rgba(0,0,0,0)' },
            }}
            transition={{ duration: 0.15, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <motion.div
              variants={{
                open: { marginTop: 0 },
                collapsed: { marginTop: -40 },
              }}
            >
              {friendRequests.map((user) => (
                <div
                  style={{
                    padding: generalPadding,
                    backgroundColor: colors.depressedWhite,
                  }}
                >
                  <UserItem user={user} />
                </div>
              ))}
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
