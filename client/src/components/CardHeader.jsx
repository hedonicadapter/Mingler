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
      className={styles.avatarWrapper}
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
        size={isWidgetHeader ? '70' : '60'}
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
              height: '50px',
              width: '50px',
              zIndex: 80,
              position: 'absolute',
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

const Markies = ({
  markyActivities,
  expanded,
  userID,
  togglePlayer,
  setPlayerURL,
  playerURL,
  playerVisible,
  reactPlayerRef,
}) =>
  markyActivities &&
  markyActivities.length > 0 &&
  markyActivities.map((activity, index) => (
    <motion.div
      key={activity}
      layout
      className={styles.markyContainer}
      initial={'hide'}
      animate={expanded ? 'show' : 'hide'}
      exit={'hide'}
      custom={index === 0}
      variants={{
        show: { opacity: 1 },
        hide: (isFirstMarky) => ({ opacity: isFirstMarky ? 1 : 0 }),
      }}
      transition={{ duration: 0.2 }}
    >
      <Marky
        {...activity}
        userID={userID}
        expanded={expanded}
        togglePlayer={togglePlayer}
        setPlayerURL={setPlayerURL}
        playerURL={playerURL}
        playerVisible={playerVisible}
        reactPlayerRef={reactPlayerRef}
      />
    </motion.div>
  ));

export default function CardHeader({
  clientDemoUser,
  activityLength,
  isWidgetHeader,
  online,
  name,
  profilePicture,
  userID,
  expanded,
  activities,

  playerURL,
  setPlayerURL,
  reactPlayerRef,
  playerVisible,
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
  const [
    randomWindow,
    randomTrack,
    randomTab,
    randomYouTube,
    setActivities,
    setDemoUser,
  ] = useFakeActivities(null);

  const shuffle = (array) => {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  };

  useEffect(() => {
    if (clientDemoUser) setDemoUser(true);
  }, [clientDemoUser]);

  // Shuffle activities sometimes
  useEffect(() => {
    if (!fakeActivities || !fakeActivities.length > 0) return;

    let clone = [...(fakeActivities || [])];
    let upToFiveMinutes = Math.random() * 300000;

    const timeout = setTimeout(() => {
      shuffle(clone);
      setFakeActivities(clone);
    }, upToFiveMinutes);
    return () => clearTimeout(timeout);
  }, [fakeActivities]);

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
    if (!clientDemoUser) return;
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

  // const FakeMarkies = () =>
  //   fakeActivities.length > 0 &&
  //   fakeActivities?.map((activity, index) =>
  //     index === 0 ? (
  //       <motion.div
  //         key={index}
  //         layout="position"
  //         className={styles.markyContainer}
  //       >
  //         <Marky
  //           {...activity}
  //           userID={userID}
  //           expanded={expanded}
  //           togglePlayer={togglePlayer}
  //           setPlayerURL={setPlayerURL}
  //           playerURL={playerURL}
  //           playerVisible={playerVisible}
  //           reactPlayerRef={reactPlayerRef}
  //         />
  //       </motion.div>
  //     ) : (
  //       <motion.div
  //         key={index}
  //         layout="position"
  //         animate={{ opacity: expanded ? 1 : 0 }}
  //         initial={{ opacity: 0 }}
  //         exit={{ opacity: 0 }}
  //         transition={{ duration: 0.2 }}
  //         className={styles.markyContainer}
  //       >
  //         <Marky
  //           {...activity}
  //           userID={userID}
  //           expanded={expanded}
  //           togglePlayer={togglePlayer}
  //           setPlayerURL={setPlayerURL}
  //           playerURL={playerURL}
  //           playerVisible={playerVisible}
  //           reactPlayerRef={reactPlayerRef}
  //         />
  //       </motion.div>
  //     )
  //   );

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
        style={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
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
          {(isMe || isWidgetHeader || online) && (
            <div className={styles.markiesContainer}>
              {/* <AnimatePresence> */}
              <Markies
                markyActivities={activities || fakeActivities}
                expanded={expanded}
                userID={userID}
                togglePlayer={togglePlayer}
                setPlayerURL={setPlayerURL}
                playerURL={playerURL}
                playerVisible={playerVisible}
                reactPlayerRef={reactPlayerRef}
              />
              {/* </AnimatePresence> */}
              <div style={{ height: 10 }} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
