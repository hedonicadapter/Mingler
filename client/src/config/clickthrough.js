// clickthrough everything except className='clickable' (pointer-events: 'auto')
export const makeClickthrough = () => {
  // const setIgnoreMouseEvents =
  //   require('electron').remote.getCurrentWindow().setIgnoreMouseEvents;
  // addEventListener('pointerover', function mousePolicy(event) {
  //   mousePolicy._canClick =
  //     event.target === document.documentElement
  //       ? mousePolicy._canClick && setIgnoreMouseEvents(true, { forward: true })
  //       : mousePolicy._canClick || setIgnoreMouseEvents(false) || 1;
  // });
  // setIgnoreMouseEvents(true, { forward: true });
  const setIgnoreMouseEvents =
    require('electron').remote.getCurrentWindow().setIgnoreMouseEvents;

  let t;

  window.addEventListener('mousemove', (event) => {
    if (event.target === document.documentElement) {
      setIgnoreMouseEvents(true, { forward: true });
      if (t) clearTimeout(t);
      t = setTimeout(function () {
        setIgnoreMouseEvents(false);
      }, 150);
    } else setIgnoreMouseEvents(false);
  });
};
