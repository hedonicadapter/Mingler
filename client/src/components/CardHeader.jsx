import React, { useState, useRef } from 'react';
import { css, styled } from '@stitches/react';
import Avatar from 'react-avatar';
import { AnimatePresence, motion } from 'framer-motion';

import colors from '../config/colors';
import Marky from './Marky';
import { useBrowserWindow } from '../contexts/BrowserWindowContext';

const nameAndActivityContainer = css({
  marginLeft: '20px',
  paddingRight: '20px',
});
const nameContainer = css({
  paddingBottom: 2,
});

const text = css({
  fontSize: '1.3em',
  letterSpacing: '1px',
  fontFamily: 'Cormorant SC',
});

const statusIndicatorContainer = css({
  position: 'absolute',
});

const AvatarContainer = ({
  expanded,
  name,
  isWidgetHeader,
  profilePicture,
  online,
  activityLength,
}) => {
  const { toggleSettings } = useBrowserWindow();

  const handleProfilePictureClick = (evt) => {
    evt.stopPropagation();
    toggleSettings('Account', 'profilePictureClicked');
  };

  return (
    <motion.div
      // animate={{
      //   scale: expanded ? 0.8 : 1,
      //   originX: expanded ? -0.5 : 0,
      //   originY: expanded ? -0.6 : 0,
      // }}
      whileHover={
        isWidgetHeader && {
          backgroundColor: colors.offWhitePressed,
          cursor: 'pointer',
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
      {!isWidgetHeader && online && (
        <OnlineStatusIndicator
          activityLength={activityLength}
          isWidgetHeader={isWidgetHeader}
        />
      )}
      <Avatar
        name={name}
        size={isWidgetHeader ? '68' : '58'}
        src={profilePicture}
        round
      />
    </motion.div>
  );
};

const OnlineStatusIndicator = ({ activityLength, isWidgetHeader }) => {
  return (
    <motion.span
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
          // display: 'inline-block',
          // minHeight: activityLength >= 2 ? 104 : 84,
          // paddingTop: isWidgetHeader ? 35 : 28,
          left: -38,
          top: -15,
        }}
      />
    </motion.span>
  );
};

export default function CardHeader({
  activityLength,
  isWidgetHeader,
  online,
  name,
  profilePicture,
  userID,
  handleNameChange,
  expanded,
  mainActivity,
  activity,
  setPlayerURL,
  togglePlayer,
  chatVisible,
  cardHovered,
  cardHeaderRef,
}) {
  const el = useRef(undefined);
  const [refresh, setRefresh] = useState(true);
  const [overflown, setOverflown] = useState();
  const [refVisible, setRefVisible] = useState(false);

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

  const markyContainer = css({
    paddingLeft: 5,
    marginLeft: isWidgetHeader ? 25 : 20,
    marginTop: 4,
    marginBottom: -4,
  });
  const markyContainerTwo = css({
    paddingLeft: 5,
    marginLeft: isWidgetHeader ? 55 : 45,
    marginTop: 6,
  });

  return (
    <div ref={cardHeaderRef}>
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
            expanded={expanded}
            name={name}
            profilePicture={profilePicture}
            isWidgetHeader={isWidgetHeader}
            online={online}
            activityLength={activityLength}
          />
        </div>
        <div className={nameAndActivityContainer()}>
          <div className={nameContainer()}>
            <motion.div
            // animate={{
            //   scale: expanded ? 0.8 : 1,
            //   originX: expanded ? -0.1 : 0,
            //   originY: expanded ? -0.4 : 0,
            // }}
            >
              <div
                className={text()}
                style={{
                  color: expanded
                    ? colors.darkmodeLightBlack
                    : colors.darkmodeBlack,
                }}
              >
                {name}
              </div>

              {/* <StyledInput
              onFocus={setFocus}
              onBlur={setBlur}
              onChange={handleNameChange}
              onMouseEnter={setEnter}
              onMouseLeave={setLeave}
              // onMouseLeave={inputHoverToggle}
              focus={inputStyle}
              className={text()}
              value={name}
              type="text"
              spellCheck={false}
            /> */}
            </motion.div>
          </div>
          <div className={markyContainer()}>
            <Marky
              {...mainActivity}
              userID={userID}
              marKey={1}
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
                      transition={{ duration: 0.15 }}
                      className={markyContainerTwo()}
                    >
                      <Marky
                        {...activity}
                        userID={userID}
                        marKey={index}
                        expanded={expanded}
                        togglePlayer={togglePlayer}
                        setPlayerURL={setPlayerURL}
                      />
                    </motion.div>
                  )
              )}
          </AnimatePresence>
          <div style={{ height: 10 }} />
        </div>
      </div>
    </div>
  );
}
