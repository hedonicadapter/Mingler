import React, { useState, useRef, useEffect } from 'react';
import Avatar from 'react-avatar';
import { AnimatePresence, motion } from 'framer-motion';

import colors from '../config/colors';
import Marky from './Marky';
import styles from './CardHeader.module.css';
import { useBrowserWindow } from '../contexts/BrowserWindowContext';
import { profilePictureToJSXImg } from '../helpers/fileManager';
import { useFakeActivities } from '../helpers/useFakeActivities';

const AvatarContainer = ({
  expanded,
  demoUser,
  name,
  isWidgetHeader,
  profilePicture,
  online,
  activityLength,
  isMe,
}) => {
  const { toggleSettings } = useBrowserWindow();

  const handleProfilePictureClick = (evt) => {
    evt.stopPropagation();
    toggleSettings('Account', 'profilePictureClicked');
  };

  return (
    <motion.div
      whileHover={
        isWidgetHeader && {
          backgroundColor: colors.offWhitePressed,
          cursor: 'pointer',
          scale: 1.05,
        }
      }
      whileTap={isWidgetHeader && { opacity: 0.5 }}
      onClick={isWidgetHeader && handleProfilePictureClick}
      style={
        isWidgetHeader && {
          borderRadius: '50%',
          backgroundColor: 'rgba(0,0,0,0)',
        }
      }
    >
      {!isWidgetHeader && (
        <OnlineStatusIndicator
          online={online}
          isMe={isMe}
          activityLength={activityLength}
          isWidgetHeader={isWidgetHeader}
        />
      )}
      <Avatar
        className="avatar"
        name={name}
        size={isWidgetHeader ? '68' : '58'}
        src={profilePictureToJSXImg(profilePicture, demoUser)}
        round
      />
    </motion.div>
  );
};

const OnlineStatusIndicator = ({
  activityLength,
  isWidgetHeader,
  online,
  isMe,
}) => {
  if (!online && !isMe) return null;
  return (
    <AnimatePresence>
      {(online || isMe) && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            pointerEvents: 'none',
            position: 'relative',
          }}
        >
          <span
            style={{
              zIndex: 80,
              position: 'absolute',
              height: '50px',
              width: '50px',
              marginLeft: 'auto',
              backgroundColor: colors.coffeeGreen,
              clipPath: 'circle(8.6px at 20px)',
              // minHeight: activityLength >= 2 ? 104 : 84,
              // paddingTop: isWidgetHeader ? 35 : 28,
              left: -38,
              top: -13,
            }}
          />
        </motion.span>
      )}
    </AnimatePresence>
  );
};

export default function CardHeader({
  clientDemoUser,
  activityLength,
  isWidgetHeader,
  online,
  name,
  profilePicture,
  userID,
  expanded,
  mainActivity,
  activity,
  setPlayerURL,
  togglePlayer,
  chatVisible,
  cardHovered,
  cardHeaderRef,
  demoUser,
  isMe,
}) {
  const el = useRef(undefined);
  const [refresh, setRefresh] = useState(true);
  const [overflown, setOverflown] = useState();
  const [refVisible, setRefVisible] = useState(false);

  // Demo user stuff
  const [fakeActivities, setFakeActivities] = useState({});
  const [randomWindow, randomTrack, randomTab, randomYouTube, setActivities] =
    useFakeActivities(null);

  useEffect(() => {
    return () => setFakeActivities(null);
  }, []);

  useEffect(() => {
    if (!randomWindow) return;

    if (fakeActivities.length > 0) {
      setFakeActivities((prevState) => {
        let filtered = prevState.filter((item) => !item.WindowTitle);
        filtered.unshift(randomWindow);

        return filtered;
      });
    } else {
      setFakeActivities([randomWindow]);
    }
  }, [randomWindow]);

  useEffect(() => {
    if (!randomTrack) return;

    if (fakeActivities.length > 0) {
      setFakeActivities((prevState) => {
        let filtered = prevState.filter((item) => !item.TrackTitle);
        filtered.unshift(randomTrack);

        return filtered;
      });
    } else {
      setFakeActivities([randomTrack]);
    }
  }, [randomTrack]);

  useEffect(() => {
    if (!randomTab) return;

    if (fakeActivities.length > 0) {
      setFakeActivities((prevState) => {
        let filtered = prevState.filter((item) => !item.TabTitle);
        filtered.unshift(randomTab);

        return filtered;
      });
    } else {
      setFakeActivities([randomTab]);
    }
  }, [randomTab]);

  useEffect(() => {
    if (!randomYouTube) return;

    if (fakeActivities.length > 0) {
      setFakeActivities((prevState) => {
        let filtered = prevState.filter((item) => !item.YouTubeTitle);
        filtered.unshift(randomYouTube);

        return filtered;
      });
    } else {
      setFakeActivities([randomYouTube]);
    }
  }, [randomYouTube]);

  useEffect(() => {
    // If this cardheader belongs to a default demo friend
    if (
      clientDemoUser?.demoDefaultFriendIDs.includes(userID) &&
      online &&
      !isMe &&
      !isWidgetHeader
    ) {
      setActivities(clientDemoUser?.fakeActivities);
    }
    if (!online) {
      setActivities(null);
    }
  }, [clientDemoUser, userID, online]);

  function checkOverflow(el) {
    if (el === undefined || el === null) return false;

    var curOverflow = el.style.overflow;

    if (!curOverflow || curOverflow === 'visible') el.style.overflow = 'hidden';
    var isOverflowing =
      el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;

    el.style.overflow = curOverflow;

    return isOverflowing;
  }

  React.useLayoutEffect(() => {
    setOverflown(checkOverflow(el.current));
  }, [refresh]);

  const refreshOverflowChecker = () => {
    setRefresh(!refresh);
  };

  return (
    <motion.div
      ref={cardHeaderRef}
      animate={expanded ? 'show' : 'hide'}
      variants={{
        show: { height: 'auto' },
        hide: { height: 86 },
      }}
      transition={{ duration: 0.15 }}
    >
      <div
        style={
          {
            // margin: 'auto',
            // paddingBottom: 24,
          }
        }
      >
        <div style={{ float: 'left', paddingRight: '12px' }}>
          <AvatarContainer
            demoUser={demoUser}
            expanded={expanded}
            name={name}
            profilePicture={profilePicture}
            isWidgetHeader={isWidgetHeader}
            online={online}
            activityLength={activityLength}
            isMe={isMe}
          />
        </div>
        <div className={styles.nameAndActivityContainer}>
          <motion.div className={styles.nameContainer}>
            <div
              className={styles.text}
              style={{
                color: expanded
                  ? colors.darkmodeLightBlack
                  : colors.darkmodeBlack,
              }}
            >
              {name}
            </div>
          </motion.div>
          <AnimatePresence>
            {(isMe || isWidgetHeader || online) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div
                  className={styles.markyContainer}
                  style={{ marginLeft: isWidgetHeader ? 25 : 20 }}
                >
                  <Marky
                    {...mainActivity}
                    {...fakeActivities[0]}
                    userID={userID}
                    expanded={expanded}
                    togglePlayer={togglePlayer}
                    setPlayerURL={setPlayerURL}
                  />
                </div>
                <AnimatePresence>
                  {expanded &&
                    activity?.map(
                      (activity, index) =>
                        index != 0 && (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className={styles.markyContainerTwo}
                            style={{ marginLeft: isWidgetHeader ? 55 : 45 }}
                          >
                            <Marky
                              {...activity}
                              userID={userID}
                              expanded={expanded}
                              togglePlayer={togglePlayer}
                              setPlayerURL={setPlayerURL}
                            />
                          </motion.div>
                        )
                    )}
                  {expanded &&
                    fakeActivities &&
                    fakeActivities.length > 0 &&
                    fakeActivities?.map(
                      (activity, index) =>
                        index != 0 && (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className={styles.markyContainerTwo}
                            style={{ marginLeft: isWidgetHeader ? 55 : 45 }}
                          >
                            <Marky
                              {...activity}
                              userID={userID}
                              expanded={expanded}
                              togglePlayer={togglePlayer}
                              setPlayerURL={setPlayerURL}
                            />
                          </motion.div>
                        )
                    )}
                </AnimatePresence>
                <div style={{ height: 10 }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
