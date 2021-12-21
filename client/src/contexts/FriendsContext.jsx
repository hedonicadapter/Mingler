import { ipcRenderer } from 'electron';
import React, { useContext, useState, useEffect, createContext } from 'react';

import DAO from '../config/DAO';
import { useAuth } from './AuthContext';
import { useClientSocket } from './ClientSocketContext';

const FriendsContext = createContext();
export function useFriends() {
  return useContext(FriendsContext);
}

export function FriendsProvider({ children }) {
  const { currentUser, token } = useAuth();
  const { socket } = useClientSocket();

  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState(null);
  const [filteredFriends, setFilteredFriends] = useState([]);

  useEffect(() => {
    getFriends();
    getFriendRequests();
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    setFriendRequestListeners();

    if (friends) {
      setConversationListeners();
      setActivityListeners();
    }

    return () => {
      socket.removeAllListeners('friendrequest:receive');
      socket.removeAllListeners('friendrequest:cancelreceive');
      socket.removeAllListeners('message:receive');
      socket.removeAllListeners('activity:receive');
    };
  }, [socket, friends]);

  const getFriends = () => {
    DAO.getFriends(currentUser._id, token)
      .then((res) => {
        res.data?.friends.forEach((object, index) => {
          object.key = index;
        });

        const friendIDs = res.data.friends.map((friend) => {
          return friend._id;
        });

        setFriends(res.data?.friends);

        console.log(res.data.friends);
      })
      .catch((e) => {
        console.error(e);
        //show some error component
      });
  };

  const getFriendRequests = () => {
    DAO.getFriendRequests(currentUser._id, token)
      .then((res) => {
        res.data.friendRequests.forEach((object, index) => {
          object.key = index;
        });

        setFriendRequests(res.data.friendRequests);
      })
      .catch((e) => {
        console.log(e);
        //show some error component
      });
  };

  const setFriendRequestListeners = () => {
    socket.removeAllListeners('friendrequest:receive');
    socket.removeAllListeners('friendrequest:cancelreceive');

    socket.once('friendrequest:receive', () => {
      getFriendRequests();
    });

    socket.once('friendrequest:cancelreceive', () => {
      getFriendRequests();
    });
  };

  const setConversationListeners = () => {
    socket.removeAllListeners('message:receive');

    socket.once('message:receive', ({ fromID, message }) => {
      console.error('fix this');
      setFriends((prevState) => {
        return prevState.map((friend) => {
          // if (friend._id === fromID) {
          //   friend.sharehubConversations.push({
          //     fromID,
          //     message,
          //     received: new Date(),
          //   });

          //   return {
          //     ...friend,
          //   };
          // }
          return friend;
        });
      });
    });
  };

  const setActivityListeners = () => {
    socket.removeAllListeners('friendrequest:cancelreceive');

    socket.once('activity:receive', (packet) => {
      // console.log('datatata ', packet.data);
      // Set activities in friends array
      setFriends((prevState) => {
        return prevState.map((friend) => {
          if (friend._id === packet.userID) {
            manageActivities(friend.activity, packet.data);
            sortActivities(friend.activity);

            return {
              ...friend,
              activity: friend.activity ? friend.activity : [packet.data],
            };
          }
          return friend;
        });
      });
    });
  };

  // Ensure activities remain unique.
  // E.g. if a user switches from one tab to another tab
  // it replaces that tab activity with the new tab activity.
  // Also prevents track activities counting as window activities.
  const manageActivities = (activitiesArray, newActivity) => {
    const newWindow = newActivity?.WindowTitle;
    const newTrack = newActivity?.TrackTitle;
    const newChromiumTab = newActivity?.TabTitle;
    const newYoutube = newActivity?.YouTubeTitle;

    let windowActivityExists = activitiesArray?.findIndex(
      (actvt) => actvt.WindowTitle
    );
    let trackActivityExists = activitiesArray?.findIndex(
      (actvt) => actvt.TrackTitle
    );
    let chromiumActivityExists = activitiesArray?.findIndex(
      (actvt) => actvt.TabTitle
    );
    let youtubeActivityExists = activitiesArray?.findIndex(
      (actvt) => actvt.YouTubeTitle
    );

    if (windowActivityExists > -1 && newWindow) {
      activitiesArray[windowActivityExists] = newActivity;
      return;
    } else if (newWindow) {
      // Prevents tracks being counted as windows
      if (activitiesArray?.filter((actvt) => actvt.TrackTitle != newWindow)) {
        activitiesArray?.push(newActivity);
        return;
      }
    }

    if (trackActivityExists > -1 && newTrack) {
      activitiesArray[trackActivityExists] = newActivity;
      return;
    } else if (newTrack) {
      activitiesArray?.push(newActivity);
      return;
    }

    if (chromiumActivityExists > -1 && newChromiumTab) {
      activitiesArray[chromiumActivityExists] = newActivity;
      return;
    } else if (newChromiumTab) {
      activitiesArray?.push(newActivity);
      return;
    }

    if (youtubeActivityExists > -1 && newYoutube) {
      activitiesArray[youtubeActivityExists] = newActivity;
      return;
    } else if (newYoutube) {
      activitiesArray?.push(newActivity);
      return;
    }
  };

  // Expand functionality to include favorites
  // and other stuff in the future
  const sortActivities = (activitiesArray) => {
    activitiesArray?.sort((a, b) => {
      return new Date(b.Date) - new Date(a.Date);
    });
  };

  const findFriends = (searchTerm) => {
    setFilteredFriends(
      searchTerm
        ? friends.filter((friend) =>
            friend.username.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : null
    );
  };

  const value = {
    friends,
    getFriends,
    setFriends,
    findFriends,
    friendRequests,
    getFriendRequests,
  };

  return (
    <FriendsContext.Provider value={value}>
      {friends && children}
    </FriendsContext.Provider>
  );
}
