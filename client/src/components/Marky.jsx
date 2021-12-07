import React, { useState, useEffect, useRef } from 'react';
import * as electron from 'electron';
import { css, styled } from '@stitches/react';
import { BiPlanet, BiWindows } from 'react-icons/bi';
import { RiArrowDropUpLine, RiSpotifyLine } from 'react-icons/ri';
import { CgYoutube } from 'react-icons/cg';
import { motion } from 'framer-motion';

import { useAuth } from '../contexts/AuthContext';

import colors from '../config/colors';
import { db } from '../config/firebase';
import SpotifyPopUp from './SpotifyPopUp';
import DAO from '../config/DAO';
import { sendYouTubeTimeRequest } from '../config/socket';
import { useStatus } from '../contexts/UserStatusContext';

const shell = electron.shell;
const ipcRenderer = electron.ipcRenderer;

const buttonVariants = {
  hover: {
    rotate: 90,
  },
};

const MarkyDiv = styled('motion.div', {
  zIndex: 50,
  flexDirection: 'row',
  display: 'flex',
  transition: 'color .25s ease',
  color: colors.darkmodeHighWhite,
  variants: {
    markyType: {
      Window: { cursor: 'default' },
      Track: {
        '&:hover': {
          color: colors.pastelGreen,
          cursor: 'pointer',
        },
      },
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
  // width: '80vw',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontSize: '0.9em',
});
const closeText = css({
  // float: 'right',
  fontWeight: '700',
  fontSize: '0.9em',
  color: colors.darkmodeDisabledText,
});
const activityIconStyle = css({
  width: 16,
  height: 16,
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

// prop: isFromHeader ?
// if true: use prop setExpanded to toggle the card body
//          and set the video at position [0]

export default function Marky({
  WindowTitle,

  TrackTitle,
  Artists,
  TrackURL,

  TabTitle,
  TabURL,

  YouTubeURL,
  YouTubeTitle,

  userID,

  expanded,

  // used to set the marky to be replaced with youtube player
  setMarkyToReplaceWithYouTubeVideo,
  markyToReplaceWithYouTubeVideo,
  marKey,
}) {
  const marqueeRef = useRef();
  const { currentUser, token } = useAuth();
  const { setAccessToken, setRefreshToken } = useStatus();

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
      (TrackTitle && setMarkyType('Track')) ||
      (TabTitle && setMarkyType('Tab')) ||
      (YouTubeURL && setMarkyType('YouTubeVideo'));
  }, [WindowTitle, TrackTitle, TabTitle, YouTubeURL]);

  const handleClick = () => {
    SpotifyPopUp(token, setAccessToken, setRefreshToken);
    if (WindowTitle) {
      return;
    } else if (TrackTitle) {
      shell.openExternal(TrackURL);
    } else if (YouTubeURL) {
      setMarkyToReplaceWithYouTubeVideo(
        markyToReplaceWithYouTubeVideo ? null : marKey
      );
      if (userID) {
        //Send yt time request to a user through server socket
        sendYouTubeTimeRequest(userID, YouTubeTitle, YouTubeURL);

        // Wait for response from ipcMain, which is connected to the server socket
        ipcRenderer.once('chromiumHostData:YouTubeTime', (event, data) => {
          shell.openExternal(YouTubeURL + '&t=' + data.time + 's');
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

    if (TrackTitle) {
      return <RiSpotifyLine className={activityIconStyle()} />;
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

  const ActivityText = () => {
    if (TabURL) {
      return <a>{TabTitle}</a>;
    }
    if (YouTubeURL) {
      return markyToReplaceWithYouTubeVideo == null && YouTubeTitle;
    }
    if (WindowTitle) {
      return WindowTitle;
    }
    if (TrackTitle) {
      return Artists + ' - ' + TrackTitle;
    }

    return null;
    // {
    //   TabURL ? (
    //     <a>{TabTitle}</a>
    //   ) : YouTubeURL ? (
    //     markyToReplaceWithYouTubeVideo == null && YouTubeTitle
    //   ) : (
    //     WindowTitle
    //   );
    // }
  };

  return (
    <MarkyDiv layout markyType={markyType} onClick={() => handleClick()}>
      <ActivityIcon />

      <div
        ref={marqueeRef}
        className={activityText()}
        style={{
          color: expanded
            ? colors.darkmodeHighWhite
            : colors.darkmodeMediumWhite,
        }}
      >
        <motion.div
          whileHover={{
            x: [0, -marqueeWidth],
            transition: {
              x: {
                repeat: Infinity,
                repeatType: 'mirror',
                repeatDelay: 0.75,
                delay: 0.15,
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
          <ActivityText />
        </motion.div>
      </div>
    </MarkyDiv>
  );
}
