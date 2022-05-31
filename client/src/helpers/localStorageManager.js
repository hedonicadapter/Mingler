import React, { useState, useEffect } from 'react';

function parseValue(value) {
  try {
    return JSON.parse(value);
  } catch (e) {
    // ain't no thang
  }

  return value;
}

export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    const jsonValue = localStorage.getItem(key);

    if (jsonValue !== 'undefined') return parseValue(jsonValue);
    if (typeof initialValue === 'function') return initialValue();
    else return initialValue;
  });

  // const customSetValue = (newValue) => {
  //   if (key === 'mostRecentRememberedUser') {
  //     const { userID } = newValue;

  //     let recentUsers = value || [];

  //     // Check if user exists
  //     const indexOfReturningUser = recentUsers.findIndex(
  //       (object) => object.userID
  //     );

  //     // If user exists, delete from array
  //     if (indexOfReturningUser) {
  //       recentUsers = recentUsers.splice(indexOfReturningUser, 1);
  //     }

  //     // And add to the top of the array
  //     recentUsers.unshift(newValue);

  //     setValue(recentUsers);
  //   } else setValue(newValue);
  // };

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};
