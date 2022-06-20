import React, { useState } from 'react';
import { css } from '@stitches/react';
import { motion } from 'framer-motion';

import { VscChromeMinimize } from 'react-icons/vsc';
import { IoIosClose } from 'react-icons/io';
import colors from '../../config/colors';

const { remote } = require('electron');
const BrowserWindow = remote.BrowserWindow;

const frameColor = colors.offWhite;
const buttonColor = colors.darkmodeLightBlack;

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

const FrameButtons = () => {
  const handleMinimize = () => {
    remote.getCurrentWindow().minimize();
  };

  const handleClose = () => {
    remote.getCurrentWindow().hide();
  };

  return (
    <>
      <motion.span
        className="undraggable"
        whileHover={hoverAnimation}
        whileTap={tapAnimation}
        onClick={() => handleMinimize()}
      >
        <VscChromeMinimize color={buttonColor} />
      </motion.span>
      <motion.span
        className="undraggable"
        whileHover={hoverAnimation}
        whileTap={tapAnimation}
        onClick={() => handleClose()}
      >
        <IoIosClose color={buttonColor} />
      </motion.span>
    </>
  );
};

const frame = css({
  flexShrink: 0,
  backgroundColor: frameColor,
});

const body = css({
  pointerEvents: 'auto',
  flexShrink: 0,
});

export const WindowFrame = ({ children }) => {
  return (
    <div>
      <div className={[frame(), 'draggable', 'clickable'].join(' ')}>
        <FrameButtons />
      </div>
      <div className={[body(), 'clickable'].join(' ')}>{children}</div>
    </div>
  );
};
