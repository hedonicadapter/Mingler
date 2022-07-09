import React, { useState } from 'react';
import { motion } from 'framer-motion';

import styles from './WindowFrame.module.css';
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

export const FrameButtons = () => {
  const handleMinimize = () => {
    remote.getCurrentWindow().minimize();
  };

  const handleClose = () => {
    remote.getCurrentWindow().hide();
  };

  return (
    <div className={styles.frameButtonsContainer}>
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

const AppTitle = () => {
  return <div className={styles.appTitleStyle}>mingler</div>;
};

const WindowTitle = ({ title }) => {
  // Is 'Mingler' in production for some reason
  const windowTitle = remote.getCurrentWindow().getTitle();

  return (
    <div className={styles.windowTitleStyle}>{title ? title : windowTitle}</div>
  );
};

export const WindowFrame = ({ children, title }) => {
  return (
    <div>
      <div
        className={[styles.frame, 'draggable', 'clickable'].join(' ')}
        style={{ backgroundColor: frameColor }}
      >
        <FrameButtons />
        <AppTitle />
        <WindowTitle title={title} />
      </div>
      <div className={[styles.body, 'clickable'].join(' ')}>{children}</div>
    </div>
  );
};
