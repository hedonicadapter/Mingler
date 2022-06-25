import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { css } from '@stitches/react';

import { IoChatbubblesOutline } from 'react-icons/io5';

import CardHeader from './CardHeader';
import CardBody from './CardBody';
import colors from '../config/colors';
import { useFriends } from '../contexts/FriendsContext';

const ipcRenderer = require('electron').ipcRenderer;

const header = css({
  zIndex: 5,
});

const OnlineStatusIndicator = ({ activityLength, isWidgetHeader }) => {
  return (
    <motion.span
      style={{
        pointerEvents: 'none',
        position: 'relative',
      }}
    >
      <span
        style={{
          zIndex: 80,
          position: 'absolute',
          height: '50px',
          width: '50px',
          backgroundColor: colors.samBlue,
          clipPath: 'circle(9px at 36px)',
          display: 'inline-block',
          minHeight: activityLength >= 2 ? 104 : 84,
          paddingTop: isWidgetHeader ? 35 : 28,
        }}
      />
    </motion.span>
  );
};

const CardSeparator = ({ cardHovered, expanded }) => {
  const separatorContainer = css({
    zIndex: 80,
    position: 'relative',
  });
  const separator = css({
    position: 'absolute',
    // height: '2px',
    outline: '1px solid ' + colors.offWhiteHovered,
    width: '100%',
    // backgroundColor: colors.offWhiteHovered,
    transition: 'opacity 0.15s ease',
    filter: 'blur(1px)',
  });

  return (
    <div className={separatorContainer()}>
      <div
        className={separator()}
        style={{
          opacity: cardHovered ? (expanded ? 0 : 1) : 0,
        }}
      />
    </div>
  );
};

export default function AccordionItem({ expandedMasterToggle }) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    console.log('accordionitem mastertoggle ', expandedMasterToggle);
    setExpanded(false);
  }, [expandedMasterToggle]);

  return <div>{'accordionItem ' + expanded ? 'true' : 'false'}</div>;
}
