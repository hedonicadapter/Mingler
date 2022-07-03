import React from 'react';
import ReactLoading from 'react-loading';

import colors from '../../config/colors';

export const LoadingAnimation = ({ formFilled, buttonText }) => {
  return formFilled === 'loading' ? (
    <ReactLoading
      style={{ marginLeft: 40 }}
      type={'spin'}
      color={colors.darkmodeLightBlack}
      height={'0.8em'}
      width={'0.8em'}
    />
  ) : (
    buttonText
  );
};
