import React, { useState, useEffect } from 'react';
import { css } from '@stitches/react';
import { motion } from 'framer-motion';

import { VscChromeMinimize } from 'react-icons/vsc';
import { IoIosClose } from 'react-icons/io';

const { remote } = require('electron');
const BrowserWindow = remote.BrowserWindow;

export const FrameButtons = () => {
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
