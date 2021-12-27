import React, { useState, useEffect } from 'react';
import { css } from '@stitches/react';
import { motion } from 'framer-motion';

import { VscChromeMinimize } from 'react-icons/vsc';
import { IoIosClose } from 'react-icons/io';
import colors from '../../config/colors';

const { remote } = require('electron');
const BrowserWindow = remote.BrowserWindow;

const FrameButtons = () => {
  const color = 'white';

  const hoverAnimation = {
    opacity: 0.5,
    transition: { duration: 0.1 },
  };

  const tapAnimation = {
    opacity: 0.3,
    transition: {
      duration: 0.1,
    },
  };

  const handleMinimize = () => {
    BrowserWindow.getFocusedWindow().minimize();
  };

  const handleClose = () => {
    BrowserWindow.getFocusedWindow().close();
  };

  return (
    <>
      <motion.span
        className="undraggable"
        whileHover={hoverAnimation}
        whileTap={tapAnimation}
        onClick={() => handleMinimize()}
      >
        <VscChromeMinimize color={color} />
      </motion.span>
      <motion.span
        className="undraggable"
        whileHover={hoverAnimation}
        whileTap={tapAnimation}
        onClick={() => handleClose()}
      >
        <IoIosClose color={color} />
      </motion.span>
    </>
  );
};

const frame = css({
  display: 'block',
  flexGrow: 0,
  flexShrink: 1,
  flexBasis: 'auto',
  alignSelf: 'right',
  order: '0',
  backgroundColor: colors.depressedWhite,
});

const body = css({
  display: 'block',
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: 'auto',
  alignSelf: 'auto',
  order: 0,
  backgroundColor: 'white',
});

export const WindowFrame = ({ children }) => {
  return (
    <>
      <div className={[frame(), 'draggable', 'clickable'].join(' ')}>
        <FrameButtons />
      </div>
      <div className={[body(), 'undraggable'].join(' ')}>{children}</div>
    </>
  );
};
