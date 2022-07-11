const path = require('path');
// const app = require('electron').remote.app;

export const getPath = (extraResourceDirectory, app) => {
  let app_path: null | string = null;
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    app_path = path.resolve(__dirname, '../', '../');
  } else {
    app_path = path.join(app.getAppPath(), '..');
  }
  const directory = path.join(app_path, extraResourceDirectory);
  return directory;
};
