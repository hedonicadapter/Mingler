import React, { useState, useEffect, useRef } from 'react';
import { css, styled } from '@stitches/react';
import Marquee from 'react-fast-marquee';
import { BiPlanet, BiWindows } from 'react-icons/bi';
import { RiArrowDropUpLine } from 'react-icons/ri';
import { CgYoutube } from 'react-icons/cg';
import { motion } from 'framer-motion';

import { useAuth } from '../contexts/AuthContext';

import colors from '../config/colors';
import { db } from '../config/firebase';

const shell = require('electron').shell;

const buttonVariants = {
  hover: {
    rotate: 90,
  },
};

const MarkyDiv = styled('div', {
  zIndex: 50,
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
      YouTubeVideo: {
        '&:hover': {
          color: colors.pastelRed,
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
});
const closeText = css({
  fontWeight: '700',
  fontSize: '0.8em',
  color: colors.darkmodeDisabledText,
});
const activityIconStyle = css({
  width: 20,
  height: 20,
  paddingRight: 8,
});
const closeIconStyle = css({
  width: 20,
  height: 20,
  paddingRight: 2,
  color: colors.darkmodeDisabledText,
});
const highZIndex = css({
  zIndex: 15,
});

export default function Marky({
  WindowTitle,
  TabTitle,
  TabURL,
  YouTubeURL,
  YouTubeTitle,
  userID,
  setMarkyToReplaceWithYouTubeVideo,
  markyToReplaceWithYouTubeVideo,
  marKey, // used to set the marky to be replaced with youtube player
}) {
  const marqueeRef = useRef();

  const { currentUser } = useAuth();

  const [playMarquee, setPlayMarquee] = useState(false);
  const [markyType, setMarkyType] = useState(null);
  const [marqueeWidth, setMarqueeWidth] = useState(0);

  useEffect(() => {
    marqueeRef.current
      ? setMarqueeWidth(
          // Width of overflowing text
          marqueeRef.current.scrollWidth - marqueeRef.current.offsetWidth
        )
      : setMarqueeWidth(0);
  }, [marqueeRef.current, WindowTitle, TabTitle, YouTubeTitle]);

  useEffect(() => {
    (WindowTitle && setMarkyType('Window')) ||
      (TabTitle && setMarkyType('Tab')) ||
      (YouTubeURL && setMarkyType('YouTubeVideo'));
  }, [WindowTitle, TabTitle, YouTubeURL]);

  const handleLinkClick = (url) => {
    shell.openExternal(url);
  };

  const handleYouTubeClick = (url) => {
    if (userID) {
      db.collection('Users')
        .doc(userID)
        .collection('YouTubeTimeRequests')
        .add(new Object())
        .then(() => {
          console.log('YouTube time successfully written!');
          setMarkyToReplaceWithYouTubeVideo(
            markyToReplaceWithYouTubeVideo ? null : marKey
          );
        })
        .catch((error) => {
          console.error('Error writing YouTube time: ', error);
        });
    }
  };

  const ActivityIcon = () => {
    if (WindowTitle) {
      return <BiWindows className={activityIconStyle()} />;
    }

    if (TabTitle || TabURL) {
      return <BiPlanet className={activityIconStyle()} />;
    }

    if (YouTubeTitle || YouTubeURL) {
      return markyToReplaceWithYouTubeVideo ? (
        <motion.div variants={buttonVariants} whileHover="hover">
          <RiArrowDropUpLine className={closeIconStyle()} />
        </motion.div>
      ) : (
        <CgYoutube className={activityIconStyle()} />
      );
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
            <a className={highZIndex()} onClick={() => handleLinkClick(TabURL)}>
              {TabTitle}
            </a>
          ) : YouTubeURL ? (
            <div
              className={highZIndex()}
              onClick={() => {
                handleYouTubeClick(YouTubeURL);
              }}
            >
              {markyToReplaceWithYouTubeVideo ? (
                <span className={closeText()}>close</span>
              ) : (
                YouTubeTitle
              )}
            </div>
          ) : (
            WindowTitle || TabTitle || YouTubeTitle
          )}
        </motion.div>
      </div>
    </MarkyDiv>
  );
}
