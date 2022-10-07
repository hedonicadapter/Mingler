import { ipcRenderer } from 'electron';
import React, { useContext, useState, useEffect, createContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { notify } from '../components/reusables/notifications';

import DAO from '../config/DAO';
import {
  getCurrentUser,
  setActivitiesMain,
} from '../mainState/features/settingsSlice';
const { useLocalStorage } = require('../helpers/localStorageManager');

const baseURL = 'ws://127.0.0.1:8080/user';
// const baseURL = 'https://menglir.herokuapp.com/user';

const socket = io(baseURL, {
  auth: { accessToken: '', userID: '' },
});

const ClientSocketContext = createContext();
export function useClientSocket() {
  return useContext(ClientSocketContext);
}

export function ClientSocketProvider({ children }) {
  const currentUser = useSelector((state) => getCurrentUser(state));
  const [activities, setActivities] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    // const object = {
    //   30517530151241: [
    //     { WinTitle: 'Busta app', Date: new Date() },
    //     { TrackTitle: 'out yonder' },
    //   ],
    //   30517530151241: [
    //     { WinTitle: 'Busta app', Date: new Date() },
    //     { TrackTitle: 'out yonder' },
    //   ],
    // };
    console.log({ activities });
  }, [activities]);

  useEffect(() => {
    ipcRenderer.on(
      'sendfriendrequest:frommain',
      sendFriendRequestFromMainHandler
    );
    ipcRenderer.on(
      'cancelfriendrequest:frommain',
      cancelFriendRequestFromMainHandler
    );

    ipcRenderer.on(
      'chromiumHostData:YouTubeTime',
      setChromiumHostDataTimeReplyHandler
    );

    return () => {
      ipcRenderer.removeAllListeners(
        'sendfriendrequest:frommain',
        sendFriendRequestFromMainHandler
      );
      ipcRenderer.removeAllListeners(
        'cancelfriendrequest:frommain',
        cancelFriendRequestFromMainHandler
      );
      ipcRenderer.removeAllListeners(
        'chromiumHostData:YouTubeTime',
        setChromiumHostDataTimeReplyHandler
      );
    };
  }, []);

  useEffect(() => {
    if (!currentUser?._id || !currentUser?.accessToken) return;

    socket.auth.userID = currentUser?._id?.replace(/['"]+/g, '');
    socket.auth.accessToken = currentUser?.accessToken;
    socket?.disconnect()?.connect();
  }, [currentUser?._id, currentUser?.accessToken]);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Client socket connected');
    });

    socket.io.on('error', (error) => {
      console.log(error);
    });
    socket.io.on('reconnect', (attempt) => {
      console.log(attempt);
    });

    socket.on('disconnect', (reason) => {
      console.log('disconnected ', reason);
    });

    socket.on('connect_error', () => {
      console.log('connect_error');
    });

    socket.on('youtubetimerequest:receive', setYouTubeTimeRequestHandler);
    socket.on('youtubetime:receive', setYouTubeTimeReceiveHandler);

    socket.on('user:online', userOnlineHandler);
    socket.on('user:offline', userOfflineHandler);

    socket.on('friendrequest:receive', friendRequestReceiveHandler);
    socket.on('friendrequest:cancelreceive', friendRequestCancelReceiveHandler);

    socket.on('message:receive', messageReceiveHandler);

    return () => {
      if (!socket) return;
      socket.disconnect();
      socket.io.off('error');
      socket.io.off('reconnect');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');

      socket.off('youtubetime:receive', setYouTubeTimeReceiveHandler);
      socket.removeAllListeners();
      socket.close();
    };
  }, []);

  useEffect(() => {
    socket.on('activity:receive:WindowTitle', activityReceiveWindowHandler);
    socket.on('activity:receive:TabTitle', activityReceiveTabHandler);
    socket.on('activity:receive:YouTubeTitle', activityReceiveYoutubeHandler);
    socket.on('activity:receive:TrackTitle', activityReceiveTrackHandler);
    console.log('bustaaaaa ');

    return () => {
      socket.off('activity:receive:WindowTitle', activityReceiveWindowHandler);
      socket.off('activity:receive:TabTitle', activityReceiveTabHandler);
      socket.off(
        'activity:receive:YouTubeTitle',
        activityReceiveYoutubeHandler
      );
      socket.off('activity:receive:TrackTitle', activityReceiveTrackHandler);
    };
  }, []);

  // const findWindowDuplicate = (newWindow, friendsActivity) => {
  //   return friendsActivity.some((actvt) => {
  //     let existingTab = actvt.TabTitle;
  //     let existingYouTube = actvt.YouTubeTitle;
  //     let existingTrack = actvt.TrackTitle;

  //     if (existingTab) {
  //       // TODO: A better way would be a fuzzy search, but this handles cases like
  //       // browsers displaying the tab name as the window name and appending
  //       // the tab count with some text
  //       let existingSubstring = existingTab.substring(0, newWindow.length);
  //       let newSubstring = newWindow.substring(0, existingTab.length);

  //       if (
  //         existingTab.includes(newSubstring) ||
  //         newWindow.includes(existingSubstring)
  //       ) {
  //         return true;
  //       }
  //     } else if (existingYouTube) {
  //       let existingSubstring = existingYouTube.substring(0, newWindow.length);
  //       let newSubstring = newWindow.substring(0, existingYouTube.length);

  //       if (
  //         existingYouTube.includes(newSubstring) ||
  //         newWindow.includes(existingSubstring)
  //       ) {
  //         return true;
  //       }
  //     } else if (existingTrack) {
  //       // TODO: Might change in the future
  //       // Spotify sets its window title as [artists] - [song title]
  //       let existingTitle = actvt.TrackTitle;
  //       let existingArtists = actvt.Artists;
  //       if (newWindow === ` ${existingArtists} - ${existingTitle}`) return true;
  //     }
  //   });
  // };

  // const _setActivities = (friendID, newActivity, activityType) => {
  //   if (!newActivity[activityType]) return;

  //   setActivities((prevState) => {
  //     let friendsActivity = prevState[friendID] ? [...prevState[friendID]] : [];

  //     // Window activities can make duplicates
  //     if (activityType === 'WindowTitle') {
  //       const isDuplicate = findWindowDuplicate(
  //         newActivity.WindowTitle,
  //         friendsActivity
  //       );

  //       console.log({ isDuplicate });

  //       if (isDuplicate) return prevState;
  //     }

  //     // Check if an activity of the same type already exists,
  //     let activityExists = friendsActivity.findIndex(
  //       (actvt) => actvt[activityType]
  //     );

  //     // replace if it does.
  //     if (activityExists > -1) {
  //       friendsActivity[activityExists] = newActivity;

  //       // Move to top, as it's the most recent activity
  //       friendsActivity.unshift(friendsActivity.splice(activityExists, 1)[0]);
  //     } else {
  //       friendsActivity.unshift(newActivity);
  //     }

  //     return {
  //       ...prevState,
  //       [friendID]: friendsActivity,
  //     };
  //   });
  // };

  const activityReceiveWindowHandler = (packet) =>
    dispatch(setActivitiesMain(packet));

  const activityReceiveTabHandler = (packet) =>
    dispatch(setActivitiesMain(packet));

  const activityReceiveYoutubeHandler = (packet) =>
    dispatch(setActivitiesMain(packet));

  const activityReceiveTrackHandler = (packet) =>
    dispatch(setActivitiesMain(packet));

  // TODO: Expand functionality to include favorites
  // and other stuff in the future
  // Update: activities are now automatically sorted by using unshift
  // const sortActivities = (activitiesArray) => {
  //   activitiesArray?.sort((a, b) => {
  //     return new Date(b.Date) - new Date(a.Date);
  //   });
  // };

  const sendFriendRequestFromMainHandler = (evt, toID) => {
    const packet = { toID, fromID: currentUser._id };

    socket.emit('friendrequest:send', packet);
  };

  const cancelFriendRequestFromMainHandler = (evt, toID) => {
    const packet = { toID, fromID: currentUser._id };

    socket.emit('friendrequest:cancel', packet);
  };

  const sendYouTubeTimeRequest = (toID, YouTubeTitle, YouTubeURL) => {
    const packet = { toID, fromID: currentUser?._id, YouTubeTitle, YouTubeURL };

    socket.emit('youtubetimerequest:send', packet);
  };

  const answerYouTubeTimeRequest = (fromID, time) => {
    const packet = { fromID, time };

    socket.emit('youtubetimerequest:answer', packet);
  };

  const setChromiumHostDataTimeReplyHandler = (evt, packet) => {
    console.log('friendscontext handler ', packet);

    answerYouTubeTimeRequest(packet?.fromID, packet?.time);
  };

  // const sendFriendRequest = (toID) => {
  //   const packet = { toID, fromID: currentUser._id };

  //   socket.emit('friendrequest:send', packet);
  // };

  const acceptFriendRequest = (toID) => {
    const packet = { toID, fromID: currentUser._id };

    socket.emit('friendrequest:accept', packet);
  };

  // const cancelFriendRequest = (toID) => {
  //   const packet = { toID, fromID: currentUser._id };

  //   socket.emit('friendrequest:cancel', packet);
  // };
  const emitActivity = (packet) => {
    console.log({ packet });
    socket.emit('activity:send', packet);
  };

  const emitMessage = (toID, fromID, messageObject) => {
    const packet = { toID, fromID, messageObject };

    socket.emit('message:send', packet);
  };

  const setYouTubeTimeRequestHandler = (packet) =>
    ipcRenderer.send('youtubetimerequest:receive:fromRenderer', packet);

  const setYouTubeTimeReceiveHandler = (packet) =>
    ipcRenderer.send('youtubetime:receive:fromRenderer', packet);

  const userOnlineHandler = (userID) =>
    ipcRenderer.send('user:online:fromRenderer', userID);

  const userOfflineHandler = (userID) =>
    ipcRenderer.send('user:offline:fromRenderer', userID);

  const friendRequestReceiveHandler = () =>
    ipcRenderer.send('friendrequest:receive:fromRenderer');

  const friendRequestCancelReceiveHandler = () =>
    ipcRenderer.send('friendrequest:cancelreceive:fromRenderer');

  const messageReceiveHandler = (packet) =>
    ipcRenderer.send('message:receive:fromRenderer', packet);

  const value = {
    acceptFriendRequest,
    sendYouTubeTimeRequest,
    emitActivity,
    emitMessage,
    socket,
    activities,
  };

  return (
    <ClientSocketContext.Provider value={value}>
      {socket && children}
    </ClientSocketContext.Provider>
  );
}
