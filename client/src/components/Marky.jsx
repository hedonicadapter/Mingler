import React, { useState, useEffect, useRef } from 'react';
import * as electron from 'electron';
import { BiPlanet } from 'react-icons/bi';
import { RiWindow2Fill, RiArrowDropUpLine } from 'react-icons/ri';
import { BsSpotify, BsYoutube } from 'react-icons/bs';
import { CgYoutube } from 'react-icons/cg';
import { motion } from 'framer-motion';

import styles from './Marky.module.css';
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

const markyVariants = {
  Window: { cursor: 'default' },
  Track: {
    color: colors.pastelGreen,
    cursor: 'pointer',
  },
  Tab: {
    color: colors.pastelBlue,
    cursor: 'pointer',
  },
  YouTubeVideo: {
    color: colors.pastelRed,
    cursor: 'pointer',
  },
};

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
  const { socket, sendYouTubeTimeRequest } = useClientSocket();

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
    return () => socket.off('youtubetime:receive', youTubeTimeHandler);
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
        socket.once('youtubetime:receive', youTubeTimeHandler);
      }
    } else if (TabURL) {
      shell.openExternal(TabURL);
    }
  };

  const youTubeTimeHandler = (time) => {
    console.log('received time ', time);
    setPlayerURL(YouTubeURL + '&t=' + time + 1 + 's'); // +1 second to offset delay
    // shell.openExternal(YouTubeURL + '&t=' + data.time + 's');
  };

  const ActivityIcon = () => {
    if (WindowTitle) {
      return <RiWindow2Fill className={styles.windowIconStyle} />;
    }

    if (TrackTitle) {
      return <BsSpotify className={styles.trackIconStyle} />;
    }

    if (TabTitle || TabURL) {
      return (
        <BiPlanet className={styles.tabIconStyle} style={{ paddingTop: 1 }} />
      );
    }

    if (YouTubeTitle || YouTubeURL) {
      return <BsYoutube className={styles.yotubeIconStyle} />;
      // return markyToReplaceWithYouTubeVideo ? (
      //   <motion.div variants={buttonVariants} whileHover="hover">
      //     <RiArrowDropUpLine className={styles.closeIconStyle} />
      //   </motion.div>
      // ) : (
      //   <BsYoutube className={styles.activityIconStyle} />
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
    <motion.div
      className={styles.marky}
      whileHover={markyType}
      variants={markyVariants}
      transition={{ duration: 0.1 }}
      onClick={(evt) => handleClick(evt)}
    >
      <ActivityIcon />
      <motion.div
        ref={marqueeRef}
        className={styles.activityText}
        style={{
          color: expanded ? colors.darkmodeBlack : colors.darkmodeLightBlack,
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
    </motion.div>
  );
}
