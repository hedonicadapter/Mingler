import React, { useEffect, useState, useRef } from 'react';
import { css, styled } from '@stitches/react';
import Avatar from 'react-avatar';
import { AnimatePresence, motion } from 'framer-motion';

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
  paddingLeft: 35,
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
  // marginTop: -25,
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
  top: -4,
  left: '-72px',
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  clipPath: 'inset(-325% -4000% -350% -580%)',
  zIndex: -1,
  boxShadow: '0 0 0 9999px rgb(18,18,18)', // used to be colors.classyWhite
});

const StyledInput = styled('input', {
  width: '54vw',
  backgroundColor: 'transparent',

  color: colors.darkmodeBlack,

  border: 'none',
  outline: 'none',
  paddingBottom: '4px',

  fontSize: '1.6em',
  fontWeight: 'initial',

  variants: {
    focus: {
      focus: {
        backgroundColor: colors.darkmodeDisabledBlack,
        borderRadius: 1,
      },
      blur: {
        backgroundColor: 'transparent',
      },
      enter: {
        backgroundColor: colors.darkmodePressed,
      },
      leave: {
        backgroundColor: 'transparent',
      },
    },
  },
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

const AvatarContainer = ({ expanded, name, isWidgetHeader }) => {
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
          outlineColor: 'rgba(0,0,0,1)',
          cursor: 'pointer',
        }
      }
      whileTap={isWidgetHeader && { opacity: 0.5 }}
      onClick={isWidgetHeader && handleProfilePictureClick}
      style={
        isWidgetHeader && {
          outline: '4px solid rgba(0,0,0,0)',
        }
      }
    >
      <Avatar name={name} size="45" />
    </motion.div>
  );
};

export default function CardHeader({
  isWidgetHeader,
  name,
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
      <OnlineStatusIndicator expanded={expanded} />
      <AvatarContainer
        expanded={expanded}
        name={name}
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
            <OfflineIndicatorAndBackground />
          </div> */}
          </div>
          <AnimatePresence>
            {!expanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={markyContainer()}
              >
                <Marky
                  {...mainActivity}
                  setMarkyToReplaceWithYouTubeVideo={
                    setMarkyToReplaceWithYouTubeVideo
                  }
                  markyToReplaceWithYouTubeVideo={
                    markyToReplaceWithYouTubeVideo
                  }
                  marKey={1}
                  expanded={expanded}
                />
              </motion.div>
            )}
          </AnimatePresence>
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
