import React, { useEffect, useState, useRef } from 'react';
import { css } from '@stitches/react';
import Avatar from 'react-avatar';
import Marquee from 'react-fast-marquee';
import { motion } from 'framer-motion';
import { Flipper, Flipped } from 'react-flip-toolkit';

import colors from '../config/colors';
import Marky from './Marky';

const flipper = css({
  backgroundColor: 'white',
  marginTop: -20, // the Flipper component has some inherent top margin
  marginLeft: -25,
  paddingBottom: 1,
});

export default function CardBody({ activity }) {
  return (
    <Flipper className={flipper()}>
      <ul>
        {activity.map((activity) => (
          <Flipped key={activity.key} flipId={'yo'}>
            <Marky {...activity} />
          </Flipped>
        ))}
      </ul>
    </Flipper>
  );
}
