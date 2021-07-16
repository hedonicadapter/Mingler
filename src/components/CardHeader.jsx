import React, { useEffect, useState, useRef } from 'react';
import { css, styled } from '@stitches/react';
import Avatar from 'react-avatar';
import { AnimatePresence, motion } from 'framer-motion';

import colors from '../config/colors';
import Marky from './Marky';

const container = css({
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
  flexDirection: 'column',
  width: '80%',
});
const text = css({
  paddingLeft: '7px',
  color: colors.darkmodeBlack,
  fontSize: '1.2em',
});

const avatar = css({});

const statusIndicatorContainer = css({
  position: 'absolute',
  // marginTop: -25,
});

const nameAndActivityPadding = css({
  paddingLeft: 2,
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
  boxShadow: '0 0 0 9999px rgba(253,245,241,255)', // colors.classyWhite
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

export default function CardHeader({
  name,
  handleNameChange,
  expanded,
  mainActivity,
  setMarkyToReplaceWithYouTubeVideo,
  markyToReplaceWithYouTubeVideo,
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
    <motion.div className={container()}>
      <motion.span
        style={{
          left: 13,
          marginTop: 16,
          position: 'absolute',
        }}
        animate={{
          scale: expanded ? 0.9 : 1,
          x: expanded ? -5 : 0,
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
      <motion.div
        animate={{
          scale: expanded ? 0.6 : 1,
          originX: expanded ? -0.5 : 0,
          originY: expanded ? -0.1 : 0,
        }}
      >
        <Avatar round className={avatar()} name={name} size="50" />
      </motion.div>
      <div className={nameAndActivityContainer()}>
        <motion.div
          animate={{
            scale: expanded ? 0.9 : 1,
            originX: expanded ? -1 : 0,
            originY: expanded ? 0.5 : 0,
          }}
          className={nameAndActivityPadding()}
        >
          <div className={text()}>{name}</div>
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
        <div className={statusIndicatorContainer()}>
          {/* {user.offline && <OfflineIndicatorAndBackground />} */}
          {/* <OfflineIndicatorAndBackground /> */}
        </div>
        <div className={nameAndActivityPadding()}>
          <AnimatePresence>
            {!expanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
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
      </div>
    </motion.div>
  );
}
