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
  paddingLeft: 40,
  paddingTop: 30,
  // marginTop: 10,
  // borderTop: '1.5px solid',
  // borderTopColor: colors.darkmodeBlack,
});

const nameAndActivityContainer = css({
  flexDirection: 'column',
  width: '80%',
});
const text = css({
  paddingLeft: '10px',
  color: colors.darkmodeBlack,
  fontSize: '1.4em',
});

const avatar = css({});

const statusIndicatorContainer = css({
  position: 'absolute',
});

const statusIndicatorAndBackground = css({
  position: 'absolute',
  top: '0px',
  left: '-80px',
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  boxShadow: '0 0 0 9999px rgba(255, 255, 255, 1)',
  clipPath: 'inset(-520% -4000% -350% -580%)',
  zIndex: -1,
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
  const [focused, setFocused] = useState();
  const [inputStyle, setInputStyle] = useState();

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
        <div className={statusIndicatorContainer()}>
          <div className={statusIndicatorAndBackground()}></div>
        </div>
        <Marky
          {...props.mainActivity}
          toggleYouTubeVideo={props.toggleYouTubeVideo}
        />
      </div>
    </div>
  );
}
