import React, { useState, useEffect } from 'react';

// clickthrough everything except className='clickable' (pointer-events: 'auto')
export default function useClickthrough() {
  // const setIgnoreMouseEvents =
  //   require('electron').remote.getCurrentWindow().setIgnoreMouseEvents;
  // addEventListener('pointerover', function mousePolicy(event) {
  //   mousePolicy._canClick =
  //     event.target === document.documentElement
  //       ? mousePolicy._canClick && setIgnoreMouseEvents(true, { forward: true })
  //       : mousePolicy._canClick || setIgnoreMouseEvents(false) || 1;
  // });
  // setIgnoreMouseEvents(true, { forward: true });
  let t;

  const setIgnoreMouseEvents =
    require('electron').remote.getCurrentWindow().setIgnoreMouseEvents;

  const mouseMoveHandler = (event) => {
    if (event.target === document.documentElement) {
      setIgnoreMouseEvents(true, { forward: true });
      if (t) clearTimeout(t);
      t = setTimeout(function () {
        setIgnoreMouseEvents(false);
      }, 150);
    } else setIgnoreMouseEvents(false);
  };

  useEffect(() => {
    window.addEventListener('mousemove', mouseMoveHandler);

    return () => {
      window.removeEventListener('mousemove', mouseMoveHandler);
      clearTimeout(t);
    };
  }, []);
}
