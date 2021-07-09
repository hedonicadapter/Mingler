import React, { useEffect, useState } from 'react';
import { css, styled } from '@stitches/react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import colors from '../config/colors';
import UserStatus from './UserStatus';
import CardHeader from './CardHeader';
import CardBody from './CardBody';

const header = css({
  zIndex: 5,
  paddingBottom: 20,
  // borderBottom: '3px solid rgba(0,0,0,0)',
  backgroundColor: 'rgba(0,0,0,0)',
});

const text = css({});

export default function WidgetHeader() {
  const { currentUser, setName } = useAuth();
  const [userName, setUserName] = useState(currentUser?.displayName);
  const [userData, setUserData] = useState({ Name: userName, Activity: [] });
  const [expanded, setExpanded] = useState(false);

  UserStatus();

  db.collection('Users')
    .doc(currentUser.uid)
    .get()
    .then((doc) => {
      let activityRef = doc.ref.collection('Activity');

      activityRef.doc('ActiveWindow').onSnapshot((querySnapshot) => {
        activityRef
          .orderBy('Date', 'desc')
          .get()
          .then((snapshot) => {
            let dbUserData = userData;

            // Clear Activity object
            dbUserData.Activity.length = 0;

            snapshot.forEach((doc) => {
              dbUserData.Activity.push(doc.data());

              setUserData(dbUserData);
            });
          });
      });

      activityRef.doc('ChromiumTab').onSnapshot((querySnapshot) => {
        activityRef
          .orderBy('Date', 'desc')
          .get()
          .then((snapshot) => {
            let dbUserData = userData;

            dbUserData.Activity.length = 0;

            snapshot.forEach((doc) => {
              dbUserData.Activity.push(doc.data());

              setUserData(dbUserData);
            });
          });
      });
    });

  const toggleExpansion = () => {
    setExpanded(!expanded);
  };

  const handleNameChange = (evt) => {
    setUserName(evt.target.value);
    setName(evt.target.value);
  };

  return (
    <>
      <motion.header
        whileHover={{
          backgroundColor: expanded ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.075)',
          // borderBottom: '3px solid rgba(0,0,0,0.3)',
        }}
        transition={{ duration: 0.15 }}
        initial={false}
        onClick={() => toggleExpansion()}
        className={header()}
      >
        <CardHeader
          currentUser
          handleNameChange={handleNameChange}
          name={userName}
          mainActivity={userData.Activity[0]}
          expanded={expanded}
        />
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
            <CardBody activity={userData.Activity} />
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
