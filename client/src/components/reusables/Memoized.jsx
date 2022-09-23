import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getApp } from '../../mainState/features/appSlice';
import { ipcRenderer } from 'electron';
import { motion } from 'framer-motion';

const Pane = ({ children }) => {
  const appState = useSelector(getApp);
  const [visible, setVisible] = useState(true);

  return (
    <motion.div
      key="pane"
      // onContextMenu={(e) => e.preventDefault()}
      initial={'hide'}
      exit={'hide'}
      transition={{ duration: 0.15 }}
      animate={appState?.appVisible ? 'show' : 'hide'}
      variants={{
        show: {
          pointerEvents: 'auto',
          transform: 'translateX(0%)',
          opacity: 1,
        },
        hide: {
          pointerEvents: 'none',
          transform: 'translateX(100%)',
          opacity: 0,
        },
      }}
      onAnimationComplete={() => ipcRenderer.send('animationComplete')}
    >
      {children}
    </motion.div>
  );
};

export const Memoized = React.memo(Pane);
