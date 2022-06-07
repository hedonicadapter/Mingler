import React, { useEffect, useState, useRef } from 'react';
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
  fontSize: '1.1em',
  textTransform: 'capitalize',
  fontWeight: 'lighter',
});

const statusIndicatorContainer = css({
  position: 'absolute',
});

const markyContainer = css({
  marginTop: 4,
  paddingLeft: 5,
  marginLeft: 22,
});

const OnlineStatusIndicator = ({ expanded }) => {
  return (
    <motion.span
      style={{
        left: 13,
        marginTop: 16,
        position: 'absolute',
      }}
      animate={{
        scale: expanded ? 0.9 : 1,
        x: expanded ? -6 : 0,
        y: expanded ? -12 : 0,
      }}
    >
      <span
        style={{
          height: '12px',
          width: '12px',
          backgroundColor: '#bbb',
          borderRadius: '50%',
          display: 'inline-block',
        }}
      ></span>
    </motion.span>
  );
};

const AvatarContainer = ({
  expanded,
  name,
  isWidgetHeader,
  profilePicture,
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
          backgroundColor: 'transparent',
        }
      }
    >
      <Avatar
        name={name}
        size={isWidgetHeader ? '68' : '58'}
        src={profilePicture}
        round
      />
    </motion.div>
  );
};

export default function CardHeader({
  isWidgetHeader,
  name,
  profilePicture,
  userID,
  handleNameChange,
  expanded,
  mainActivity,
  activity,
  setMarkyToReplaceWithYouTubeVideo,
  markyToReplaceWithYouTubeVideo,
  toggleChat,
  chatVisible,
  cardHovered,
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

  return (
    <>
      <div
        style={{
          margin: 'auto',
        }}
      >
        {/* <OnlineStatusIndicator expanded={expanded} /> */}
        <div style={{ float: 'left', paddingRight: '16px' }}>
          <AvatarContainer
            expanded={expanded}
            name={name}
            profilePicture={profilePicture}
            isWidgetHeader={isWidgetHeader}
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

            {!isWidgetHeader && (
              <div className={statusIndicatorContainer()}>
                <motion.div
                  // style={{
                  //   left: 13,
                  //   marginTop: 16,
                  //   position: 'absolute',
                  // }}
                  // animate={{
                  //   x: expanded ? -6 : 0,
                  //   y: expanded ? -12 : 0,
                  // }}
                  style={{
                    position: 'absolute',
                    // top: -4,
                    marginTop: 38,
                    left: '-88px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    // clipPath: 'inset(-325% -100vmax -500% -420%)',
                    // clipPath: 'inset(-25% -20% -20% -20%)',
                    zIndex: -1,
                    // boxShadow: '0 0 0 9999px ' + colors.offWhite, // used to be colors.classyWhite
                  }}
                />
              </div>
            )}
          </div>
          <motion.div
            // animate={expanded ? 'true' : 'false'}
            // variants={{ true: { opacity: 0 }, false: { opacity: 1 } }}
            transition={{ duration: 0.15 }}
            className={markyContainer()}
          >
            <Marky
              {...mainActivity}
              setMarkyToReplaceWithYouTubeVideo={
                setMarkyToReplaceWithYouTubeVideo
              }
              markyToReplaceWithYouTubeVideo={markyToReplaceWithYouTubeVideo}
              marKey={1}
              expanded={expanded}
            />
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
                        className={markyContainer()}
                      >
                        <Marky
                          {...activity}
                          userID={userID}
                          marKey={index}
                          expanded={expanded}
                        />
                      </motion.div>
                    )
                )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </>
  );
}
