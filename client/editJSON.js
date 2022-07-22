const fs = require('fs').promises;

export const setExtensionID = async (file, newID) => {
  return fs
    .readFile(file)
    .then((body) => JSON.parse(body))
    .then((json) => {
      json.allowed_origins = [`chrome-extension://${newID}/`];
      return json;
    })
    .then((json) => JSON.stringify(json))
    .then(async (body) => {
      await fs.writeFile(file, body);
      return body;
    })
    .catch((e) => {
      console.error(e);
      return false;
    });
};
