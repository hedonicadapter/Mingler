import icon from '../../../assets/icons/icon.ico';

export const notify = (
  title: string = '',
  body: string = '',
  silent = true
) => {
  new Notification(title, {
    body,
    silent,
    icon,
  }).onclick = () => ({});
};
