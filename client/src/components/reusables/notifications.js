export const notify = (title = '', body = '') => {
  new Notification(title, {
    body,
    silent: true,
  }).onclick = () => ({});
};
