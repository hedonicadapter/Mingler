export const notify = (
  title: string = '',
  body: string = '',
  silent = true
) => {
  new Notification(title, {
    body,
    silent,
  }).onclick = () => ({});
};
