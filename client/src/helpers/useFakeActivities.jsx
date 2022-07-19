import React, { useState, useEffect } from 'react';

const ELEVEN_POINT_SEVEN_MINUTES = 702000; // Average youtube video length
const TEN_MINUTES = 600000;
const FIVE_MINUTES = 300000;
const THREE_MINUTES_THIRTY_SECONDS = 210000; // average song length
const ONE_MINUTE = 60000;

export const useFakeActivities = (fakeActivities = {}) => {
  const [activities, setActivities] = useState(() => {
    if (typeof fakeActivities === 'function') return fakeActivities();
    else return fakeActivities;
  });

  const [randomWindow, setRandomWindow] = useState(null);
  const [randomTrack, setRandomTrack] = useState(null);
  const [randomTab, setRandomTab] = useState(null);
  const [randomYouTube, setRandomYouTube] = useState(null);

  // Used to generate a random index to pick a random activity
  const windowActivityCount = activities?.windowActivities?.length;
  const trackActivityCount = activities?.trackActivities?.length;
  const tabActivityCount = activities?.tabActivities?.length;
  const youTubeActivityCount = activities?.youTubeActivities?.length;

  let globalTimeouts = [];

  useEffect(() => {
    if (!activities) {
      // If a friend goes offline the associated timeouts are cleared
      clearEverything();
    }
  }, [activities]);

  useEffect(() => {
    // if the component is dismounted its associated timeouts are cleared
    return () => clearEverything();
  }, []);

  useEffect(() => {
    if (!activities) return;

    // Hand out activities as soon as setActivities is used
    setRandomWindow(
      activities?.windowActivities[getRandomPositiveNumber(windowActivityCount)]
    );
    setRandomTrack(
      activities?.trackActivities[getRandomPositiveNumber(trackActivityCount)]
    );
    setRandomTab(
      activities?.tabActivities[getRandomPositiveNumber(tabActivityCount)]
    );
    setRandomYouTube(
      activities?.youTubeActivities[
        getRandomPositiveNumber(youTubeActivityCount)
      ]
    );
  }, [activities]);

  useEffect(() => {
    const windowTimeout = setTimeout(() => {
      setRandomWindow(
        activities?.windowActivities[
          getRandomPositiveNumber(windowActivityCount)
        ]
      );
      // Timeout with a random number within TEN_MINUTES
    }, getRandomPositiveNumber(TEN_MINUTES));

    globalTimeouts.push(windowTimeout);

    return () => {
      clearTimeout(windowTimeout);
    };
  }, [randomWindow]);

  useEffect(() => {
    const trackTimeout = setTimeout(() => {
      setRandomTrack(
        activities?.trackActivities[getRandomPositiveNumber(trackActivityCount)]
      );
    }, getRandomPositiveNumber(THREE_MINUTES_THIRTY_SECONDS));

    globalTimeouts.push(trackTimeout);

    return () => {
      clearTimeout(trackTimeout);
    };
  }, [randomTrack]);

  useEffect(() => {
    const tabTimeout = setTimeout(() => {
      setRandomTab(
        activities?.tabActivities[getRandomPositiveNumber(tabActivityCount)]
      );
    }, getRandomPositiveNumber(ONE_MINUTE));

    globalTimeouts.push(tabTimeout);

    return () => {
      clearTimeout(tabTimeout);
    };
  }, [randomTab]);

  useEffect(() => {
    const youTubeTimeout = setTimeout(() => {
      setRandomYouTube(
        activities?.youTubeActivities[
          getRandomPositiveNumber(youTubeActivityCount)
        ]
      );
    }, getRandomPositiveNumber(ELEVEN_POINT_SEVEN_MINUTES));

    globalTimeouts.push(youTubeTimeout);

    return () => {
      clearTimeout(youTubeTimeout);
    };
  }, [randomYouTube]);

  const clearEverything = () => {
    globalTimeouts.forEach(clearTimeout);
    setRandomWindow(null);
    setRandomTrack(null);
    setRandomTab(null);
    setRandomYouTube(null);
  };

  return [randomWindow, randomTrack, randomTab, randomYouTube, setActivities];
};

export const getRandomPositiveNumber = (maxNumber, minNumber = 1) => {
  return Math.floor(Math.random() * (maxNumber - minNumber) + minNumber);
};
