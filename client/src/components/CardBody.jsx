import React, { useEffect, useState, useRef } from 'react';
import { css } from '@stitches/react';
import Avatar from 'react-avatar';
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion';
import { Flipper, Flipped } from 'react-flip-toolkit';
import ReactPlayer from 'react-player/youtube';

import colors from '../config/colors';
import Marky from './Marky';

const flipper = css({
  backgroundColor: colors.darkmodeLightBlack,
  // marginTop: -16, // the Flipper component has some inherent top margin
  // marginLeft: -25,
  // paddingBottom: 1,
});
const markyContainer = css({
  marginLeft: -30,
  padding: 6,
});

export default function CardBody({ activity, userID, expanded }) {
  return (
    <>
      <div className={flipper()}>
        <motion.ul layout>
          {activity?.map((activity, index) => (
            <motion.div layout className={markyContainer()}>
              <Marky
                {...activity}
                userID={userID}
                marKey={index}
                expanded={expanded}
              />
            </motion.div>
          ))}
        </motion.ul>
      </div>
    </>
  );
}
