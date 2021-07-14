import React, { useState, useEffect, useRef } from 'react';
import { css, styled } from '@stitches/react';
import { BiPlanet, BiWindows } from 'react-icons/bi';
import { RiArrowDropUpLine } from 'react-icons/ri';
import { CgYoutube } from 'react-icons/cg';
import { motion } from 'framer-motion';

import { useAuth } from '../contexts/AuthContext';

import colors from '../config/colors';
import { db } from '../config/firebase';
import SpotifyPopUp from './SpotifyPopUp';

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
  float: 'right',
  fontWeight: '700',
  fontSize: '0.9em',
  color: colors.darkmodeDisabledText,
});
const activityIconStyle = css({
  width: 20,
  height: 20,
  paddingRight: 8,
});
const closeIconStyle = css({
  float: 'right',
  width: 20,
  height: 20,
  paddingRight: 0,
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

  // used to set the marky to be replaced with youtube player
  setMarkyToReplaceWithYouTubeVideo,
  markyToReplaceWithYouTubeVideo,
  marKey,
}) {
  const marqueeRef = useRef();

  const { currentUser } = useAuth();

  const [playMarquee, setPlayMarquee] = useState(false);
  const [markyType, setMarkyType] = useState(null);
  const [marqueeWidth, setMarqueeWidth] = useState(0);

  useEffect(() => {
    // marKey of this specific Marky changes when the
    // user changes activity. If:
    // 1. this Marky has setMarkyToReplaceWithYouTubeVideo as a function
    // 2. the marKey isn't the one in the header (0)
    // 3. markyToReplaceWithYouTubeVideo isn't null (meaning the user hasn't clicked a video activity)
    // 4. the marKey is already correctly set
    if (
      setMarkyToReplaceWithYouTubeVideo &&
      marKey != 0 &&
      markyToReplaceWithYouTubeVideo != null &&
      markyToReplaceWithYouTubeVideo != marKey
    ) {
      setMarkyToReplaceWithYouTubeVideo(marKey);
    }
  }, [marKey]);

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

  const handleClick = () => {
    SpotifyPopUp();
    console.log('clicked');
    if (WindowTitle) {
      return;
    } else if (YouTubeURL) {
      setMarkyToReplaceWithYouTubeVideo(
        markyToReplaceWithYouTubeVideo ? null : marKey
      );
      if (userID) {
        db.collection('Users')
          .doc(userID)
          .collection('YouTubeTimeRequests')
          .add(new Object())
          .then(() => {
            console.log('YouTube time successfully written!');
          })
          .catch((error) => {
            console.error('Error writing YouTube time: ', error);
          });
      }
    } else if (TabURL) {
      shell.openExternal(TabURL);
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
    <MarkyDiv markyType={markyType} onClick={() => handleClick()}>
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
            <a>{TabTitle}</a>
          ) : YouTubeURL ? (
            markyToReplaceWithYouTubeVideo == null && YouTubeTitle
          ) : (
            WindowTitle
          )}
        </motion.div>
      </div>
    </MarkyDiv>
  );
}
