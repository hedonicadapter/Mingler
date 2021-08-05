setMostRecentUser = (userID, username = '', fingerprint = '', guest) => {
  let recentUsers =
    window.localStorage.getObject('mostRecentRememberedUser') || [];

  console.log(recentUsers instanceof Array);
  recentUsers.unshift({ userID, username, fingerprint, guest });

  window.localStorage.setObject('mostRecentRememberedUser', recentUsers);
};

getMostRecentUser = () => {
  return window.localStorage.getObject('mostRecentRememberedUser')?.[0];
};

Storage.prototype.setObject = function (key, object) {
  return this.setItem(key, JSON.stringify(object));
};

Storage.prototype.getObject = function (key) {
  return JSON.parse(this.getItem(key));
};

module.exports = { setMostRecentUser, getMostRecentUser };
