import React, { useState, useEffect, useRef } from 'react';
import * as electron from 'electron';
import { css, styled } from '@stitches/react';
import { BiPlanet } from 'react-icons/bi';
import { RiWindow2Fill, RiArrowDropUpLine } from 'react-icons/ri';
import { BsSpotify, BsYoutube } from 'react-icons/bs';
import { CgYoutube } from 'react-icons/cg';
import { motion } from 'framer-motion';

import colors from '../config/colors';
import DAO from '../config/DAO';
import { useStatus } from '../contexts/UserStatusContext';
import { useClientSocket } from '../contexts/ClientSocketContext';
import { useSelector } from 'react-redux';
import { getApp } from '../mainState/features/appSlice';

const shell = electron.shell;
const ipcRenderer = electron.ipcRenderer;

const buttonVariants = {
  hover: {
    rotate: 90,
  },
};

const MarkyDiv = styled('div', {
  zIndex: 80,
  flexDirection: 'row',
  display: 'flex',
  transition: 'color .25s ease',
  color: colors.darkmodeBlack,
  alignItems: 'center',
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
  fontSize: '0.9em',

  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});
const closeText = css({
  // float: 'right',
  fontWeight: '700',
  fontSize: '0.9em',
  color: colors.darkmodeDisabledText,
});

const windowIconStyle = css({
  width: '19px; !important',
  height: '19px; !important',
  paddingRight: 5,
  paddingLeft: 1,
});
const trackIconStyle = css({
  width: '17px; !important',
  height: '17px; !important',
  paddingRight: 6,
  paddingLeft: 1,
});
const tabIconStyle = css({
  width: '21px; !important',
  height: '21px; !important',
  paddingRight: 4,
});
const yotubeIconStyle = css({
  width: '17px; !important',
  height: '17px; !important',
  paddingRight: 7,
  paddingLeft: 1,
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
  togglePlayer,
  setPlayerURL,

  userID,

  expanded,

  marKey,
}) {
  const { sendYouTubeTimeRequest } = useClientSocket();

  const appState = useSelector(getApp);

  const marqueeRef = useRef();
  const { setAccessToken, setRefreshToken } = useStatus();

  const [markyType, setMarkyType] = useState(null);
  const [marqueeWidth, setMarqueeWidth] = useState();

  useEffect(() => {
    if (marqueeRef.current) {
      setMarqueeWidth(
        // Width of overflowing text
        marqueeRef.current.scrollWidth - marqueeRef.current.offsetWidth
      );
    } else {
      setMarqueeWidth(0);
    }
  }, [
    marqueeRef,
    WindowTitle,
    TrackTitle,
    TabTitle,
    YouTubeTitle,
    appState.windowWidth,
  ]);

  useEffect(() => {
    (WindowTitle && setMarkyType('Window')) ||
      (TrackTitle && setMarkyType('Track')) ||
      (TabTitle && setMarkyType('Tab')) ||
      (YouTubeTitle && setMarkyType('YouTubeVideo'));
  }, [WindowTitle, TrackTitle, TabTitle, YouTubeTitle]);

  useEffect(() => {
    return () =>
      ipcRenderer.removeAllListeners(
        'chromiumHostData:YouTubeTime',
        youTubeTimeHandler
      );
  }, []);

  const handleClick = (evt) => {
    evt.stopPropagation();
    if (WindowTitle) {
      return;
    } else if (TrackTitle) {
      shell.openExternal(TrackURL);
    } else if (YouTubeURL) {
      setPlayerURL(YouTubeURL);
      if (userID) {
        //Send yt time request to a user through server socket
        sendYouTubeTimeRequest(userID, YouTubeTitle, YouTubeURL);

        togglePlayer();
        // Wait for response from ipcMain, which is connected to the server socket
        ipcRenderer.once('chromiumHostData:YouTubeTime', youTubeTimeHandler);
      }
    } else if (TabURL) {
      shell.openExternal(TabURL);
    }
  };

  const youTubeTimeHandler = (event, data) => {
    setPlayerURL(YouTubeURL + '&t=' + data.time + 's');
    // shell.openExternal(YouTubeURL + '&t=' + data.time + 's');
  };

  const ActivityIcon = () => {
    if (WindowTitle) {
      return <RiWindow2Fill className={windowIconStyle()} />;
    }

    if (TrackTitle) {
      return <BsSpotify className={trackIconStyle()} />;
    }

    if (TabTitle || TabURL) {
      return <BiPlanet className={tabIconStyle()} style={{ paddingTop: 1 }} />;
    }

    if (YouTubeTitle || YouTubeURL) {
      return <BsYoutube className={yotubeIconStyle()} />;
      // return markyToReplaceWithYouTubeVideo ? (
      //   <motion.div variants={buttonVariants} whileHover="hover">
      //     <RiArrowDropUpLine className={closeIconStyle()} />
      //   </motion.div>
      // ) : (
      //   <BsYoutube className={activityIconStyle()} />
      // );
    }

    return null;
  };

  const ActivityText = () => {
    if (TabURL) {
      return <a>{TabTitle}</a>;
    }
    if (YouTubeURL) {
      return YouTubeTitle;
    }
    if (WindowTitle) {
      return WindowTitle;
    }
    if (TrackTitle) {
      return Artists + ' - ' + TrackTitle;
    }

    return null;
  };

  return (
    <MarkyDiv markyType={markyType} onClick={(evt) => handleClick(evt)}>
      <ActivityIcon />
      <motion.div
        ref={marqueeRef}
        className={activityText()}
        style={{
          color: expanded ? colors.darkmodeBlack : colors.darkmodeLightBlack,
          width: '100%',
          zIndex: 50,
        }}
      >
        <motion.div
          style={{
            width: '100%',
            zIndex: 50,
            letterSpacing: '1px',
            fontSize: '0.8em',
          }}
          onMouseOver={() => console.log('hello')} //makes it work for some reason
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
                    ? 4
                    : marqueeWidth > 30
                    ? 3
                    : marqueeWidth > 20
                    ? 2
                    : marqueeWidth > 10
                    ? 1
                    : 0,
                ease: 'easeOut',
              },
            },
          }}
        >
          <ActivityText />
        </motion.div>
      </motion.div>
    </MarkyDiv>
  );
}
