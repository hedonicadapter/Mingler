import React, { useState, useEffect, useContext, createContext } from 'react';

import DAO from '../config/DAO';
import { useLocalStorage } from '../helpers/localStorageManager';
import { useClientSocket } from './ClientSocketContext';
import { useDispatch, useSelector } from 'react-redux';
import {
  getCurrentUser,
  setAccessTokenMain,
  setSpotifyAccessTokenMain,
  setSpotifyExpiryDate,
} from '../mainState/features/settingsSlice';
import { notify } from '../components/reusables/notifications';

const { ipcRenderer } = require('electron');

const UserStatusContext = createContext();

export function useStatus() {
  return useContext(UserStatusContext);
}

// Starts the script (../scripts/ActiveWindowListener.py) that listens for the user's
// foreground window and returns it here.
//
// The youtube and chromium listeners are handled by the dedicated chromium extension.
function UserStatusProvider({ children }) {
  const currentUser = useSelector(getCurrentUser);
  const dispatch = useDispatch();

  const { emitActivity } = useClientSocket();

  const activeWindowListener = () => {
    ipcRenderer.on('windowinfo:frommain', windowInfoFromMainHandler);
  };

  const activeTabListener = () => {
    ipcRenderer.on('chromiumHostData', chromiumHostDataHandler);
  };

  const activeTrackListener = async (spotifyAccessToken) => {
    console.warn('ACTIVETRACKLISTENER');

    const result = await ipcRenderer.invoke(
      'initActiveTrackListener:fromrenderer',
      spotifyAccessToken
    );

    if (spotifyAccessToken === 'disconnect') return;

    if (result)
      return ipcRenderer.on('trackinfo:frommain', trackInfoFromMainHandler);

    return (
      spotifyAccessToken !== 'disconnect' &&
      notify('Error', 'Failed to initialize Spotify.')
    );
  };

  const windowInfoFromMainHandler = (evt, windowInfo) => {
    const packet = {
      data: windowInfo,
      userID: currentUser?._id,
      type: 'WindowTitle',
    };

    emitActivity(packet);
  };

  const trackInfoFromMainHandler = (evt, trackInfo) => {
    const packet = {
      data: trackInfo,
      userID: currentUser?._id,
      type: 'TrackTitle',
    };

    emitActivity(packet);
  };

  const refreshSpotify = () => {
    DAO.refreshSpotify(
      currentUser?.spotifyRefreshToken,
      currentUser._id,
      currentUser?.accessToken
    )
      .then((result) => {
        if (!result.data) return;

        dispatch(setSpotifyAccessTokenMain(result.data.body.access_token));
        dispatch(setSpotifyExpiryDate(result.data.body.spotifyExpiryDate));
      })
      .catch((e) => {
        console.log('Refreshing spotify error ', e);
      });
  };

  const disconnectSpotifyHandler = () => {
    emitActivity({
      data: {
        Artists: '',
        TrackTitle: 'disconnect',
        TrackURL: '',
        Date: new Date(),
      },
      userID: currentUser?._id,
      type: 'TrackTitle',
    });
  };

  const chromiumHostDataHandler = (event, data) => {
    if (data.YouTubeTitle) {
      emitActivity({
        data: {
          YouTubeTitle: data?.YouTubeTitle,
          YouTubeURL: data?.YouTubeURL,
          Date: new Date(),
        },
        userID: currentUser?._id,
        type: 'YouTubeTitle',
      });
    } else {
      emitActivity({
        data: {
          //Either tabdata or youtube data is sent, never both
          TabTitle: data?.TabTitle,
          TabURL: data?.TabURL,
          Date: new Date(),
        },
        userID: currentUser?._id,
        type: 'TabTitle',
      });
    }
  };

  useEffect(() => {
    if (!currentUser?.spotifyExpiryDate) return;

    let now = new Date();
    let spotifyExpiryDate = new Date(currentUser?.spotifyExpiryDate);
    let time = spotifyExpiryDate - now;

    const refreshTimeout = setTimeout(
      () => {
        refreshSpotify();
      },
      spotifyExpiryDate > now ? time : 0
    );

    // console.log(
    //   'set spotify refresh timeout for ',
    //   spotifyExpiryDate > now ? Math.floor(time / 60000) : 0,
    //   ' minutes.'
    // );

    return () => clearTimeout(refreshTimeout);
  }, [currentUser?.spotifyExpiryDate]);

  useEffect(
    () => {
      activeWindowListener();
      activeTabListener();

      ipcRenderer.on('disconnectspotify:frommain', disconnectSpotifyHandler);

      return () => {
        ipcRenderer.removeAllListeners(
          'windowinfo:frommain',
          windowInfoFromMainHandler
        );
        ipcRenderer.removeAllListeners(
          'chromiumHostData',
          chromiumHostDataHandler
        );
        ipcRenderer.removeAllListeners(
          'disconnectspotify:frommain',
          disconnectSpotifyHandler
        );
      };
    },
    [
      // currentUser?._id
    ]
  );

  useEffect(() => {
    if (!currentUser?.spotifyAccessToken) return;

    activeTrackListener(currentUser.spotifyAccessToken);

    return () => {
      ipcRenderer.removeAllListeners(
        'trackinfo:frommain',
        trackInfoFromMainHandler
      );
    };
  }, [currentUser?.spotifyAccessToken]);

  const value = { activeTrackListener };

  return (
    <UserStatusContext.Provider value={value}>
      {children}
    </UserStatusContext.Provider>
  );
}

export default React.memo(UserStatusProvider);
