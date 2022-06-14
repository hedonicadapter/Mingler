export const dateBySecondsFromNow = (seconds) => {
  console.log('?? ', seconds);
  const now = new Date();
  return now.setSeconds(now.getSeconds() + seconds);
};
