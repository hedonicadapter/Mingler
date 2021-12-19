import React, { useEffect, useState, useRef } from 'react';

export const ScrollAnchor = () => {
  const anchorRef = useRef();

  useEffect(
    () => anchorRef.current?.scrollIntoView({ behavior: 'smooth' }),
    [anchorRef]
  );
  return <div ref={anchorRef}></div>;
};
