import { css, styled } from '@stitches/react';
import React from 'react';
import ReactLoading from 'react-loading';

import colors from '../../config/colors';

const loadingAnimation = css({
  marginLeft: 40,
});

export const LoadingAnimation = ({ formFilled, buttonText }) => {
  return formFilled === 'loading' ? (
    <ReactLoading
      className={loadingAnimation()}
      type={'spin'}
      color={colors.darkmodeLightBlack}
      height={'0.8em'}
      width={'0.8em'}
    />
  ) : (
    buttonText
  );
};
