import React, { useEffect, useState, useRef } from 'react';
const { styled } = require('@stitches/react');

import colors from '../../config/colors';

const Separator = styled('h5', {
  display: 'flex',
  flexDirection: 'row',
  paddingInline: '5%',
  color: colors.darkmodeDisabledText,

  '&:before': {
    content: '',
    flex: '1 1',
    borderBottom: '1px solid ' + colors.darkmodeDisabledText,
    margin: 'auto',
    marginRight: '10px',
  },
  '&:after': {
    content: '',
    flex: '1 1',
    borderBottom: '1px solid ' + colors.darkmodeDisabledText,
    margin: 'auto',
    marginLeft: '10px',
  },
});

export const Separator = ({ children }) => {
  return <Lines>{children}</Lines>;
};
