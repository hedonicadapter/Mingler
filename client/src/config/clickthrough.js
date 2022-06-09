// clickthrough everything except className='clickable' (pointer-events: 'auto')
export const makeClickthrough = () => {
  const setIgnoreMouseEvents =
    require('electron').remote.getCurrentWindow().setIgnoreMouseEvents;
  addEventListener('pointerover', function mousePolicy(event) {
    mousePolicy._canClick =
      event.target === document.documentElement
        ? mousePolicy._canClick && setIgnoreMouseEvents(true, { forward: true })
        : mousePolicy._canClick || setIgnoreMouseEvents(false) || 1;
  });
  setIgnoreMouseEvents(true, { forward: true });
};
