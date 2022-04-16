import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { css } from '@stitches/react';

import colors from '../config/colors';

const container = css({ width: '100%' });
const header = css({
  width: '100%',
  paddingBlock: 8,

  color: colors.darkmodeDisabledText,
});
const settingText = css({ paddingLeft: 16 });
const subSettings = css({
  color: colors.darkmodeMediumWhite,
  fontSize: '0.9em',
  paddingLeft: 20,

  paddingBlock: 4,
});
const bodyContainer = css({});
const body = css({
  width: '100%',
});

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
    <div className={container()}>
      <motion.header
        animate={isExpanded ? 'expanded' : 'notExpanded'}
        variants={{
          expanded: {
            color: colors.darkmodeHighWhite,
            backgroundColor: colors.darkmodeBlack,
          },
          notExpanded: {
            color: colors.darkmodeMediumWhite,
            backgroundColor: colors.darkmodeLightBlack,
          },
        }}
        whileHover={{
          color: colors.darkmodeHighWhite,
          cursor: 'pointer',
        }}
        whileTap={{ opacity: 0.8 }}
        transition={{ duration: 0.1 }}
        onClick={() => toggleExpansion()}
        className={header()}
      >
        <div className={settingText()}> {setting.title}</div>
      </motion.header>
      <div className={bodyContainer()}>
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
              className={body()}
            >
              <div className={subSettings()}> other setting</div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
