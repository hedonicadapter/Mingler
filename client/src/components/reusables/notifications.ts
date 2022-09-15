import defaultIcon from '../../../assets/icons/icon.ico';
import { profilePictureToJSXImg } from '../../helpers/fileManager';
const { nativeImage } = require('electron');

export const notify = (
  title: string = '',
  body: string = '',
  silent = true,
  icon
) => {
  let thumbnail;
  if (icon?.image) thumbnail = profilePictureToJSXImg(icon);

  new Notification(title, {
    body,
    silent,
    icon: thumbnail || defaultIcon,
  });
};
