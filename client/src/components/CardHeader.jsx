import React, { useEffect, useState, useRef } from 'react';
import { css, styled } from '@stitches/react';
import Avatar from 'react-avatar';
import { motion } from 'framer-motion';

import {
  RiChatSmile2Fill,
  RiChatSmileFill,
  RiWechat2Fill,
} from 'react-icons/ri';

import colors from '../config/colors';
import Marky from './Marky';
import MenuButton from './MenuButton';

const container = css({
  width: '100%',
  backgroundColor: 'transparent',
  flexDirection: 'row',
  display: 'flex',
  paddingLeft: 46,
  paddingTop: 10,
  paddingBottom: 10,
  // marginTop: 10,
  // borderTop: '1.5px solid',
  // borderTopColor: colors.darkmodeBlack,
});

const nameAndActivityContainer = css({
  // flexDirection: 'column',
  display: 'flex',
  flexDirection: 'column',
  paddingRight: 10,
});
const nameContainer = css({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const text = css({
  paddingLeft: '7px',
  fontSize: '1.2em',
});

const statusIndicatorContainer = css({
  position: 'absolute',
});

const nameAndActivityPadding = css({
  paddingLeft: 2,
});

const markyContainer = css({
  display: 'flex',
  flexDirection: 'row',
  padding: 5,
  paddingLeft: 6,
});

const OfflineIndicatorAndBackground = styled('div', {
  position: 'absolute',
  // top: -4,
  marginTop: 15,
  left: '-70px',
  width: '14px',
  height: '14px',
  borderRadius: '50%',
  clipPath: 'inset(-325% -100vmax -800% -420%)',
  zIndex: -1,
  boxShadow: '0 0 0 9999px ' + colors.offWhite, // used to be colors.classyWhite
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
  const handleProfilePictureClick = (evt) => {
    evt.stopPropagation();
  };

  return (
    <motion.div
      animate={{
        scale: expanded ? 0.6 : 1,
        originX: expanded ? -0.5 : 0,
        originY: expanded ? -0.1 : 0,
      }}
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
        size={isWidgetHeader ? '56' : '48'}
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
  handleNameChange,
  expanded,
  mainActivity,
  setMarkyToReplaceWithYouTubeVideo,
  markyToReplaceWithYouTubeVideo,
  toggleChat,
  chatVisible,
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

  const messageIcon = css({
    height: 36,
    width: 36,
    transition: 'color 0.1s ease',

    color: expanded
      ? chatVisible
        ? colors.darkmodeMediumWhite
        : colors.darkmodeBlack
      : colors.darkmodeBlack,
    '&:hover': {
      color: colors.darkmodeHighWhite,
    },
  });

  return (
    <motion.div className={container()}>
      {/* <MenuButton /> */}
      {/* <OnlineStatusIndicator expanded={expanded} /> */}
      <AvatarContainer
        expanded={expanded}
        name={name}
        profilePicture={profilePicture}
        isWidgetHeader={isWidgetHeader}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%',
          alignItems: expanded ? 'start' : 'center',
        }}
      >
        <div className={nameAndActivityContainer()}>
          <div className={nameContainer()}>
            <motion.div
              animate={{
                scale: expanded ? 0.9 : 1,
                originX: expanded ? -0.8 : 0,
                originY: expanded ? 0.5 : 0,
              }}
            >
              <div
                className={text()}
                style={{
                  color: expanded
                    ? colors.darkmodeMediumWhite
                    : colors.darkmodeHighWhite,
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

            {/* <div className={statusIndicatorContainer()}>
            {user.offline && <OfflineIndicatorAndBackground />}
          </div> */}
            <div className={statusIndicatorContainer()}>
              <OfflineIndicatorAndBackground />
            </div>
          </div>
          <motion.div
            animate={expanded ? 'true' : 'false'}
            variants={{ true: { opacity: 0 }, false: { opacity: 1 } }}
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
          </motion.div>
        </div>
        {!isWidgetHeader && (
          <div style={{ paddingRight: 45 }} onClick={(e) => toggleChat(e)}>
            <RiWechat2Fill className={messageIcon()} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
