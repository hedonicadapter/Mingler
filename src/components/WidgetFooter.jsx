import React, { useEffect, useState } from 'react';
import { css, styled } from '@stitches/react';

import colors from '../config/colors';

const container = css({
  backgroundColor: 'white',
  position: 'fixed',
  bottom: 0,
  right: 0,
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
