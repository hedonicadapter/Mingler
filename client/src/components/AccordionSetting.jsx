import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { css } from '@stitches/react';

import colors from '../config/colors';
import animations from '../config/animations';

const container = css({ width: '100%', textAlign: 'right' });
const header = css({
  width: '100%',
  paddingBlock: 8,

  color: colors.darkmodeBlack,
});
const settingText = css({ fontSize: '0.8em', paddingRight: 12 });
const subSettings = css({
  color: colors.darkmodeLightBlack,
  fontSize: '0.7em',
  paddingRight: 12,

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
        className={header()}
        style={index === 0 ? { paddingTop: 30 } : {}}
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
              {/* <div className={subSettings()}> other setting</div> */}
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
