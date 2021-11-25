import { css, styled } from '@stitches/react';
import React from 'react';
import ReactLoading from 'react-loading';

import colors from '../../config/colors';

export const LoadingAnimation = () => {
  const loadingAnimation = css({
    marginLeft: 8,
    display: 'inline-block',
    alignSelf: 'center',
  });
  return (
    <ReactLoading
      className={loadingAnimation()}
      type={'spin'}
      color={colors.darkmodeHighWhite}
      height={'0.8em'}
      width={'0.8em'}
    />
  );
};
