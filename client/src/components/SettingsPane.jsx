import React, { useEffect, useState } from 'react';
import { css, styled } from '@stitches/react';

import { useAuth } from '../contexts/AuthContext';
import colors from '../config/colors';

const electron = require('electron');
const remote = electron.remote;

const StyledInput = styled('input', {
  marginLeft: '3%',
  width: '58vw',

  backgroundColor: 'transparent',
  color: colors.darkmodeHighWhite,
  border: 'none',
  outline: 'none',
  padding: '5px',
  paddingLeft: '6px',

  fontSize: '1.2em',
  fontWeight: 'initial',

  variants: {
    focus: {
      true: {
        backgroundColor: colors.darkmodeDisabledBlack,
        borderRadius: 1,
      },
      false: {
        backgroundColor: 'transparent',
      },
    },
  },
});

const container = css({
  backgroundColor: colors.darkOpacity,
  height: '100vh',
  // width: '30px',
  // width: window.innerWidth,
});

export default function SettingsPane(props) {
  const { currentUser, setName } = useAuth();
  const [userName, setUserName] = useState(currentUser?.displayName);
  const [inputFocus, setInputFocus] = useState();

  const inputFocusToggle = (evt) => {
    setInputFocus(!inputFocus);
  };
  const handleNameChange = (evt) => {
    setUserName(evt.target.value);
    setName(evt.target.value);
  };

  const handleBackButton = () => {
    props.toggleSettingsPane();
  };

  return (
    <React.Fragment>
      <div className={container()}>
        <button onClick={handleBackButton}>go back</button>
        <StyledInput
          onFocus={inputFocusToggle}
          onBlur={inputFocusToggle}
          onChange={handleNameChange}
          focus={inputFocus}
          value={userName}
          type="text"
          spellCheck={false}
        />
      </div>
    </React.Fragment>
  );
}
