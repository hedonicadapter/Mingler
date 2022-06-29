import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AccordionSetting.module.css';

import colors from '../config/colors';
import animations from '../config/animations';

export default function AccordionSetting({
  setting,
  expanded,
  setExpanded,
  index,
}) {
  const isExpanded = index === expanded;

  const toggleExpansion = () => {
    setExpanded(isExpanded ? false : index);
  };

  return (
    <div className={styles.container}>
      <motion.header
        animate={isExpanded ? 'expanded' : 'notExpanded'}
        variants={{
          expanded: {
            color: colors.darkmodeBlack,
            backgroundColor: colors.offWhite,
          },
          notExpanded: {
            color: colors.darkmodeDisabledText,
            backgroundColor: colors.offWhitePressed,
          },
        }}
        whileHover={{
          color: colors.darkmodeLightBlack,
          cursor: 'pointer',
        }}
        whileTap={animations.whileTap}
        transition={{ duration: 0.1 }}
        onClick={() => toggleExpansion()}
        style={
          index === 0
            ? { paddingTop: 30, paddingBottom: 8 }
            : { paddingBlock: 8 }
        }
        className={styles.header}
      >
        <div className={styles.settingText}> {setting.title}</div>
      </motion.header>
      <div
      // className={styles.bodyContainer}
      >
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.section
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: { height: 'auto', opacity: 1 },
                collapsed: { height: 0, opacity: 0 },
              }}
              transition={{ duration: 0.15, ease: [0.04, 0.62, 0.23, 0.98] }}
              className={styles.body}
            >
              {/* <div className={subSettings()}> other setting</div> */}
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
