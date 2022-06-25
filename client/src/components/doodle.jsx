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

export default function AccordionItem({ expandedMasterToggle }) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    console.log('accordionitem mastertoggle ', expandedMasterToggle);
    setExpanded(false);
  }, [expandedMasterToggle]);

  return <div>{'accordionItem ' + expanded ? 'true' : 'false'}</div>;
}
