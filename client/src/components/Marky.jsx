import React, { useState, useEffect, useRef } from 'react';
import * as electron from 'electron';
import { BiPlanet } from 'react-icons/bi';
import { RiWindow2Fill, RiArrowDropUpLine } from 'react-icons/ri';
import { BsSpotify, BsYoutube } from 'react-icons/bs';
import { CgYoutube } from 'react-icons/cg';
import { AnimatePresence, motion, useMotionValue } from 'framer-motion';

import styles from './Marky.module.css';
import colors from '../config/colors';
import DAO from '../config/DAO';
import { useStatus } from '../contexts/UserStatusContext';
import { useClientSocket } from '../contexts/ClientSocketContext';
import { useSelector } from 'react-redux';
import { getApp } from '../mainState/features/appSlice';
import animations from '../config/animations';

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
  },
  Tab: {
    color: colors.pastelBlue,
  },
  YouTubeVideo: {
    color: colors.pastelRed,
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
}) {
  const { socket, sendYouTubeTimeRequest } = useClientSocket();

  const appState = useSelector(getApp);

  const marqueeRef = useRef(null);
  const { setAccessToken, setRefreshToken } = useStatus();

  const [markyType, setMarkyType] = useState(null);
  const [marqueeWidth, setMarqueeWidth] = useState();
  const [showFade, setShowFade] = useState(true);
  const x = useMotionValue(0);

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
    const unsub = x.onChange((latest) => {
      let offset = -marqueeWidth + 20; // Offset by 20 so that it starts fading out before iteration end
      if (latest <= offset) {
        //Means the animation has come to its iteration's end (it repeats, so it's an iteration)

        setShowFade(false);
      } else {
        setShowFade(true);
      }
    });

    return () => unsub();
  }, [marqueeWidth]);

  useEffect(() => {
    (WindowTitle && setMarkyType('Window')) ||
      (TrackTitle && setMarkyType('Track')) ||
      (TabTitle && setMarkyType('Tab')) ||
      (YouTubeTitle && setMarkyType('YouTubeVideo'));
  }, [WindowTitle, TrackTitle, TabTitle, YouTubeTitle]);

  useEffect(() => {
    return () => socket.off('youtubetime:receive', youTubeTimeHandler);
  }, []);

  // TODO: open only trusted
  const openInBrowser = (url) =>
    url.startsWith('https') && shell.openExternal(url);

  const handleClick = (evt) => {
    evt.stopPropagation();
    if (WindowTitle) {
      return;
    } else if (TrackTitle) {
      openInBrowser(TrackURL);
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
      openInBrowser(TabURL);
    }
  };

  const youTubeTimeHandler = (time) => {
    console.log('received time ', time);
    setPlayerURL(YouTubeURL + '&t=' + time + 1 + 's'); // +1 second to offset delay
    // shell.openExternal(YouTubeURL + '&t=' + data.time + 's');
  };

  const ActivityIcon = () => {
    if (WindowTitle) {
      return <RiWindow2Fill className={styles.iconStyle} size={20} />;
    }

    if (TrackTitle) {
      return <BsSpotify className={styles.iconStyle} size={19} />;
    }

    if (TabTitle || TabURL) {
      return <BiPlanet className={styles.iconStyle} size={20} />;
    }

    if (YouTubeTitle || YouTubeURL) {
      return <BsYoutube className={styles.iconStyle} size={19} />;
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
      style={{ opacity: expanded ? 0.9 : 0.86 }}
      whileHover={markyType}
      whileTap={markyType !== 'Window' && animations.whileTap}
      variants={markyVariants}
      transition={{ duration: 0.1 }}
      onClick={(evt) => handleClick(evt)}
    >
      <ActivityIcon />
      <motion.div ref={marqueeRef} className={styles.activityText}>
        <AnimatePresence>
          {expanded ? (
            <motion.div
              key={0}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <motion.div
                animate={showFade ? 'showFade' : 'hideFade'}
                variants={{
                  showFade: {
                    opacity: 1,
                  },
                  hideFade: {
                    opacity: 0,
                  },
                }}
                transition={{
                  duration: 1.15,
                }}
                className={styles.fade}
                style={{
                  background: `linear-gradient(to right, rgba(0, 0, 0, 0), ${colors.offWhiteHovered})`,
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key={1}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <motion.div
                animate={showFade ? 'showFade' : 'hideFade'}
                variants={{
                  showFade: {
                    opacity: 1,
                  },
                  hideFade: {
                    opacity: 0,
                  },
                }}
                transition={{
                  duration: 1.15,
                }}
                className={styles.fade}
                style={{
                  background: `linear-gradient(to right, rgba(0, 0, 0, 0), ${colors.offWhite})`,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{
            width: '100%',
            zIndex: 50,
            letterSpacing: '1px',
            fontSize: '0.8em',
            x,
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
