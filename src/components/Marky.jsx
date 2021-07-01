import React, { useState, useEffect } from 'react';
import { css, styled } from '@stitches/react';
import Marquee from 'react-fast-marquee';
import { BiPlanet, BiWindows } from 'react-icons/bi';

import colors from '../config/colors';

const shell = require('electron').shell;

const MarkyDiv = styled('div', {
  padding: 6,
  flexDirection: 'row',
  display: 'flex',
  transition: 'color .25s ease',
  // -moz-transition: color 0.2s ease-in;
  // -o-transition: color 0.2s ease-in;
  // -webkit-transition: color 0.2s ease-in;
  variants: {
    markyType: {
      Window: { cursor: 'default' },
      Tab: {
        '&:hover': {
          color: colors.pastelBlue,
          cursor: 'pointer',
        },
      },
    },
  },
});
const activityText = css({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  color: colors.darkmodeBlack,
});
const activityIconStyle = css({
  paddingRight: 8,
});

export default function Marky({ WindowTitle, TabTitle, TabURL }) {
  const [playMarquee, setPlayMarquee] = useState(false);
  const [markyType, setMarkyType] = useState();

  useEffect(() => {
    (WindowTitle && setMarkyType('Window')) ||
      (TabTitle && setMarkyType('Tab'));
  }, []);

  const handleLinkClick = (url) => {
    shell.openExternal(url);
  };

  const ActivityIcon = () => {
    if (TabTitle || TabURL) {
      return <BiPlanet className={activityIconStyle()} />;
    }

    if (WindowTitle) {
      return <BiWindows className={activityIconStyle()} />;
    }
    return null;
  };

  return (
    <MarkyDiv markyType={markyType}>
      <ActivityIcon />
      {(WindowTitle?.length > 35 && playMarquee) ||
      (TabTitle?.length > 35 && playMarquee) ? (
        <Marquee play={playMarquee} gradientWidth={25} speed={25}>
          <div
            onMouseEnter={() => {
              setPlayMarquee(true);
            }}
            onMouseLeave={() => {
              setPlayMarquee(false);
            }}
          >
            {TabURL ? (
              <React.Fragment>
                <a onClick={() => handleLinkClick(TabURL)}>
                  {WindowTitle || TabTitle}
                </a>
              </React.Fragment>
            ) : (
              WindowTitle || TabTitle
            )}
            <span>&nbsp;&nbsp;</span>
          </div>
        </Marquee>
      ) : (
        <div
          className={activityText()}
          onMouseEnter={() => {
            setPlayMarquee(true);
          }}
          onMouseLeave={() => {
            setPlayMarquee(false);
          }}
        >
          {WindowTitle || TabTitle}
        </div>
      )}
    </MarkyDiv>
  );
}
