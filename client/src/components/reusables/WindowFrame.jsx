import React, { useState } from 'react';
import { css } from '@stitches/react';
import { motion } from 'framer-motion';

import { VscChromeMinimize } from 'react-icons/vsc';
import { IoIosClose } from 'react-icons/io';
import colors from '../../config/colors';
import animations from '../../config/animations';

const { remote } = require('electron');

const frameColor = colors.offWhite;
const buttonColor = colors.defaultPlaceholderTextColor;

const hoverAnimation = {
  color: colors.darkmodeBlack,
  transition: { duration: 0.1 },
};

const frameButton = css({
  color: colors.defaultPlaceholderTextColor,
  padding: 2,
});

const FrameButtons = () => {
  const handleMinimize = () => {
    remote.getCurrentWindow().minimize();
  };

  const handleClose = () => {
    remote.getCurrentWindow().hide();
  };

  return (
    <div>
      <motion.span
        className={[frameButton(), 'undraggable'].join(' ')}
        whileHover={hoverAnimation}
        whileTap={animations.whileTap}
        onClick={() => handleClose()}
      >
        <IoIosClose />
      </motion.span>
      <motion.span
        className={[frameButton(), 'undraggable'].join(' ')}
        whileHover={hoverAnimation}
        whileTap={animations.whileTap}
        onClick={() => handleMinimize()}
      >
        <VscChromeMinimize />
      </motion.span>
    </div>
  );
};

const WindowTitle = () => {
  const windowTitle = remote.getCurrentWindow().getTitle().toLowerCase();

  const windowTitleStyle = {
    letterSpacing: '1px',
    fontSize: '0.9em',
    color: colors.defaultPlaceholderTextColor,
    padding: 2,
  };

  return <div style={windowTitleStyle}>{windowTitle}</div>;
};

const frame = css({
  flexShrink: 0,
  backgroundColor: frameColor,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  padding: 6,
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
        <WindowTitle />
      </div>
      <div className={[body(), 'clickable'].join(' ')}>{children}</div>
    </div>
  );
};
