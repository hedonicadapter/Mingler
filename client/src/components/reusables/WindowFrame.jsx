import React, { useState } from 'react';
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
        className={[styles.frameButton, 'undraggable'].join(' ')}
        whileHover={hoverAnimation}
        whileTap={animations.whileTap}
        onClick={() => handleClose()}
      >
        <IoIosClose />
      </motion.span>
      <motion.span
        className={[styles.frameButton, 'undraggable'].join(' ')}
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

  return <div className={styles.windowTitleStyle}>{windowTitle}</div>;
};

export const WindowFrame = ({ children }) => {
  return (
    <div>
      <div
        className={[styles.frame, 'draggable', 'clickable'].join(' ')}
        style={{ backgroundColor: frameColor }}
      >
        <FrameButtons />
        <WindowTitle />
      </div>
      <div className={[styles.body, 'clickable'].join(' ')}>{children}</div>
    </div>
  );
};
