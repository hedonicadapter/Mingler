import React, { useEffect, useState } from 'react';
import { css, styled } from '@stitches/react';

import colors from '../config/colors';

const container = css({
  backgroundColor: colors.classyWhite,
  height: '100%',
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  flexDirection: 'column',
});
const button = css({
  alignSelf: 'flex-end',
});

export default function WidgetFooter(props) {
  return (
    <div className={container()}>
      <div className={button()}>
        <button onClick={() => console.log('toggled settings')}>
          settings
        </button>
      </div>
    </div>
  );
}
