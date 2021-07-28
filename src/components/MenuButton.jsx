import React, { useEffect, useState } from 'react';
import { css, styled } from '@stitches/react';
import { GoPrimitiveDot } from 'react-icons/go';

import { useAuth } from '../contexts/AuthContext';
import colors from '../config/colors';
import { AnimatePresence, motion } from 'framer-motion';

const StyledInput = styled('input', {
  marginLeft: '3%',
  width: '58vw',

  backgroundColor: 'transparent',
  color: colors.darkmodeHighWhite,
  border: 'none',
  outline: 'none',
  padding: '5px',
  paddingLeft: '6px',

  fontSize: '1.2em',
  fontWeight: 'initial',

  variants: {
    focus: {
      true: {
        backgroundColor: colors.darkmodeDisabledBlack,
        borderRadius: 1,
      },
      false: {
        backgroundColor: 'transparent',
      },
    },
  },
});

const container = css({ position: 'absolute', top: 0, right: 0, margin: 10 });
const menuButtonStyle = css({
  position: 'absolute',
  top: 0,
  right: 0,
  margin: 16,
  height: 12,
  width: 12,
  borderRadius: '50%',
  zIndex: 50,
});

export default function MenuButton() {
  const [menuVisibility, setMenuVisibility] = useState(false);
  const toggleMenu = () => {
    setMenuVisibility(!menuVisibility);
  };

  return (
    <>
      <AnimatePresence>
        {menuVisibility && (
          <motion.div
            className={container()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ staggerChildren: 0.25 }}
            style={{
              width: 90,
              backgroundColor: 'black',
              color: 'white',
            }}
            onMouseEnter={() => setMenuVisibility(true)}
            onMouseLeave={() => setMenuVisibility(false)}
          >
            <motion.ol
              style={{
                listStyleType: 'none',
                paddingLeft: 0,
                listStyle: 'none',
                paddingLeft: 10,
              }}
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              initial="hidden"
              animate="show"
            >
              <motion.li
                whileHover={{ color: 'rgba(255,255,255,0.7)' }}
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
              >
                Help
              </motion.li>
              <motion.li
                whileHover={{ color: 'rgba(255,255,255,0.7)' }}
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
              >
                Close
              </motion.li>
              <hr />
              <motion.li
                whileHover={{ color: 'rgba(255,255,255,0.7)' }}
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
              >
                Exit
              </motion.li>
            </motion.ol>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className={menuButtonStyle()}
        animate={menuVisibility ? 'visible' : 'hidden'}
        variants={{
          visible: { backgroundColor: 'rgba(255,255,255,1)' },
          hidden: { backgroundColor: 'rgba(0,0,0,1)' },
        }}
        onMouseEnter={() => setMenuVisibility(true)}
        onMouseLeave={() => setMenuVisibility(false)}
      ></motion.div>
    </>
    // <motion.div
    //   key={0}
    //   initial={{ borderRadius: '50%' }}
    //   animate={{ position: 'fixed' }}
    //   whileHover={{
    //     borderRadius: '10%',
    //     // scaleX: 1.5,
    //     // scaleY: 1.5,
    //     scaleY: 6,
    //     width: 100,
    //     // y: 0,
    //   }}
    //   className={menuButtonStyle()}
    // >
    //   <div style={{ fontSize: '0.2em' }}>yooo</div>
    // </motion.div>
  );
}