import React, { useEffect, useState } from 'react';
import { css, styled } from '@stitches/react';

import colors from '../config/colors';

const container = css({
  backgroundColor: colors.classyWhite,
  flex: 1,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
});
const button = css({
  alignSelf: 'flex-end',
});

export default function WidgetFooter(props) {
  return (
    <footer className={container()}>
      <div className={button()}>
        <button onClick={() => console.log('toggled settings')}>⚙</button>
      </div>
    </footer>
  );
}
