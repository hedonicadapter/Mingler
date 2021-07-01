import React, { useEffect, useState } from 'react';
import { css, styled } from '@stitches/react';
import Avatar from 'react-avatar';
import { GoPrimitiveDot } from 'react-icons/go';
import { BiPlanet } from 'react-icons/bi';

import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import colors from '../config/colors';
import UserStatus from './UserStatus';

const container = css({
  height: '118px',
  backgroundColor: 'white',
  flexDirection: 'row',
  display: 'flex',
});

const avatar = css({
  marginTop: 18,
  marginLeft: 15,
});

const text = css({});

const nameAndActivityContainer = css({
  marginTop: 26,
  flexDirection: 'column',
  paddingLeft: '22px',
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

export default function WidgetHeader() {
  const { currentUser, setName } = useAuth();
  const [userName, setUserName] = useState(currentUser?.displayName);
  const [inputFocus, setInputFocus] = useState();
  const [inputHover, setInputHover] = useState();
  const [inputStyle, setInputStyle] = useState();
  const [focused, setFocused] = useState();

  const handleNameChange = (evt) => {
    setUserName(evt.target.value);
    setName(evt.target.value);
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
    <React.Fragment>
      <div className={container()}>
        <Avatar round className={avatar()} name={userName} size="62" />
        <div className={nameAndActivityContainer()}>
          <StyledInput
            onFocus={setFocus}
            onBlur={setBlur}
            onChange={handleNameChange}
            onMouseEnter={setEnter}
            onMouseLeave={setLeave}
            // onMouseLeave={inputHoverToggle}
            focus={inputStyle}
            className={text()}
            value={userName}
            type="text"
            spellCheck={false}
          />
          <UserStatus />
        </div>
      </div>
    </React.Fragment>
  );
}
