import React, { useEffect, useState, useRef } from 'react';
import { css, styled } from '@stitches/react';
import Avatar from 'react-avatar';
import Marquee from 'react-fast-marquee';
import { motion } from 'framer-motion';

import colors from '../config/colors';
import Marky from './Marky';

const container = css({
  backgroundColor: 'transparent',
  flexDirection: 'row',
  display: 'flex',
  paddingLeft: 50,
  paddingTop: 30,
  paddingBottom: 13,
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
  fontSize: '1.4em',
});

const avatar = css({});

const statusIndicatorContainer = css({
  position: 'absolute',
  // marginTop: -25,
});

const nameAndActivityPadding = css({
  paddingLeft: 6,
});

const StatusIndicatorAndBackground = styled('div', {
  position: 'absolute',
  top: -4,
  left: '-82px',
  width: '16px',
  height: '16px',
  borderRadius: '50%',
  clipPath: 'inset(-325% -4000% -350% -580%)',
  zIndex: -1,

  variants: {
    expanded: {
      true: {
        boxShadow: '0 0 0 9999px rgba(241,235,232,255)', // colors.depressedWhite
      },
      false: {
        boxShadow: '0 0 0 9999px rgba(253,245,241,255)', // colors.classyWhite
      },
    },
  },
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

export default function CardHeader(props) {
  const el = useRef(undefined);
  const [refresh, setRefresh] = useState(true);
  const [overflown, setOverflown] = useState();
  const [refVisible, setRefVisible] = useState(false);
  const [focused, setFocused] = useState(null);
  const [inputStyle, setInputStyle] = useState(null);

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

  const setFocus = () => {
    setInputStyle('focus');
    setFocused(true);
  };
  const setBlur = () => {
    setInputStyle('blur');
    setFocused(false);
  };
  const setEnter = () => {
    !focused ? setInputStyle('enter') : null;
  };
  const setLeave = () => {
    !focused ? setInputStyle('leave') : null;
  };

  return (
    <div className={container()}>
      <Avatar round className={avatar()} name={props.name} size="58" />
      <div className={nameAndActivityContainer()}>
        <div className={nameAndActivityPadding()}>
          {!props.currentUser ? (
            <div className={text()}>{props.name}</div>
          ) : (
            <StyledInput
              onFocus={setFocus}
              onBlur={setBlur}
              onChange={props.handleNameChange}
              onMouseEnter={setEnter}
              onMouseLeave={setLeave}
              // onMouseLeave={inputHoverToggle}
              focus={inputStyle}
              className={text()}
              value={props.name}
              type="text"
              spellCheck={false}
            />
          )}
        </div>
        <div className={statusIndicatorContainer()}>
          <StatusIndicatorAndBackground expanded={props.expanded} />
        </div>
        <div className={nameAndActivityPadding()}>
          <Marky
            {...props.mainActivity}
            toggleYouTubeVideo={props.toggleYouTubeVideo}
          />
        </div>
      </div>
    </div>
  );
}
