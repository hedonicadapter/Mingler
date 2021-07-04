import React, { useState, useEffect, useRef } from 'react';
import { css, styled } from '@stitches/react';
import Marquee from 'react-fast-marquee';
import { BiPlanet, BiWindows } from 'react-icons/bi';
import { motion } from 'framer-motion';

import colors from '../config/colors';

const shell = require('electron').shell;

const MarkyDiv = styled('div', {
  padding: 6,
  flexDirection: 'row',
  display: 'flex',
  transition: 'color .25s ease',
  // -moz-transition: color 0.2s ease-in;
  // -o-transition: color 0.2s ease-in;
  // -webkit-transition: color 0.2s ease-in;
  variants: {
    markyType: {
      Window: { cursor: 'default' },
      Tab: {
        '&:hover': {
          color: colors.pastelBlue,
          cursor: 'pointer',
        },
      },
    },
  },
});
const activityText = css({
  width: '90%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  color: colors.darkmodeBlack,
});
const activityIconStyle = css({
  paddingRight: 8,
});

export default function Marky({ WindowTitle, TabTitle, TabURL }) {
  const marqueeRef = useRef();

  const [playMarquee, setPlayMarquee] = useState(false);
  const [markyType, setMarkyType] = useState();
  const [marqueeWidth, setMarqueeWidth] = useState(0);

  useEffect(() => {
    marqueeRef.current
      ? setMarqueeWidth(
          // Width of overflowing text
          marqueeRef.current.scrollWidth - marqueeRef.current.offsetWidth
        )
      : setMarqueeWidth(0);
  }, [marqueeRef.current]);

  useEffect(() => {
    (WindowTitle && setMarkyType('Window')) ||
      (TabTitle && setMarkyType('Tab'));
  }, []);

  const handleLinkClick = (url) => {
    shell.openExternal(url);
  };

  const ActivityIcon = () => {
    if (TabTitle || TabURL) {
      return <BiPlanet className={activityIconStyle()} />;
    }

    if (WindowTitle) {
      return <BiWindows className={activityIconStyle()} />;
    }
    return null;
  };

  return (
    <MarkyDiv markyType={markyType}>
      <ActivityIcon />

      <div ref={marqueeRef} className={activityText()}>
        <motion.div
          whileHover={{
            x: [0, -marqueeWidth],
            transition: {
              x: {
                repeat: Infinity,
                repeatType: 'mirror',
                repeatDelay: 0.75,
                duration:
                  marqueeWidth > 40
                    ? 1
                    : marqueeWidth > 30
                    ? 2
                    : marqueeWidth > 20
                    ? 3
                    : marqueeWidth > 10
                    ? 4
                    : 0,
                ease: 'anticipate',
              },
            },
          }}
        >
          {TabURL ? (
            <a onClick={() => handleLinkClick(TabURL)}>
              {WindowTitle || TabTitle}
            </a>
          ) : (
            WindowTitle || TabTitle
          )}
        </motion.div>
      </div>
    </MarkyDiv>
  );
}
