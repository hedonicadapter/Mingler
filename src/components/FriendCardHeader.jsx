import React, { useEffect, useState, useRef } from 'react';
import { css } from '@stitches/react';
import Avatar from 'react-avatar';
import Marquee from 'react-fast-marquee';

import colors from '../config/colors';
import Marky from './Marky';

const container = css({
  backgroundColor: 'transparent',
  flexDirection: 'row',
  display: 'flex',
  height: '20px',
  paddingLeft: 40,
  paddingTop: 8,
  paddingBottom: 30,
  // marginTop: 10,
  // borderTop: '1.5px solid',
  // borderTopColor: colors.darkmodeBlack,
});
const fillerDiv = css({
  height: 20,
  backgroundColor: 'white',
});

const nameAndActivityContainer = css({
  flexDirection: 'column',
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
  boxShadow: '0 0 0 9999px rgba(255, 255, 255, 1)', //darkmodeLightBlack
  clipPath: 'inset(-520% -4000% -200% -580%)',
  zIndex: -1,
});

export default function FriendCardHeader(props) {
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
    <React.Fragment>
      <div className={container()}>
        <Avatar round className={avatar()} name={props.name} size="58" />
        <div className={nameAndActivityContainer()}>
          <text className={text()}>{props.name}</text>
          <div className={statusIndicatorContainer()}>
            <div className={statusIndicatorAndBackground()}></div>
          </div>
          <Marky {...props.mainActivity} />
        </div>
      </div>
      {/* <div className={fillerDiv()}></div> */}
    </React.Fragment>
  );
}
