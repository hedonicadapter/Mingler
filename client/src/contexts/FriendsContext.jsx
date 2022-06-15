import { ipcRenderer } from 'electron';
import React, { useContext, useState, useEffect, createContext } from 'react';
import { useSelector } from 'react-redux';

import DAO from '../config/DAO';
import { profilePictureToJSXImg } from '../helpers/fileManager';
import { getCurrentUser } from '../mainState/features/settingsSlice';
import { useClientSocket } from './ClientSocketContext';

const FriendsContext = createContext();
export function useFriends() {
  return useContext(FriendsContext);
}

export function FriendsProvider({ children }) {
  const currentUser = useSelector((state) => getCurrentUser(state));
  const { socket } = useClientSocket();

  const [friends, setFriends] = useState([]);
  const [conversations, setConversations] = useState(null);
  const [friendRequests, setFriendRequests] = useState(null);
  const [filteredFriends, setFilteredFriends] = useState([]);

  useEffect(() => {
    console.log('ffff ', friends);
  }, [friends]);
  useEffect(() => {
    console.log('cccc ', conversations);
  }, [conversations]);

  useEffect(() => {
    if (!currentUser?.accessToken) return;

    getFriends();
    getConversations();
    getFriendRequests();
  }, [currentUser, socket]);

  useEffect(() => {
    console.log('socket? ', socket);
    if (!socket) return;
    setFriendRequestListeners();
    setUserStatusListener();
    setConversationListeners();
    setActivityListeners();

    // return () => {
    //   socket.removeAllListeners('friendrequest:receive');
    //   socket.removeAllListeners('friendrequest:cancelreceive');
    //   socket.removeAllListeners('message:receive');
    //   socket.removeAllListeners('activity:receive');
    //   socket.removeAllListeners('user:online');
    //   socket.removeAllListeners('user:offline');
    // };
  }, [socket]);

  const getConversations = () => {
    DAO.getConversations(currentUser._id, currentUser.accessToken).then(
      (res) => {
        setConversations(res?.data);
      }
    );
  };
  const getFriends = () => {
    DAO.getFriends(currentUser._id, currentUser.accessToken)
      .then((res) => {
        res.data?.friends.forEach((object, index) => {
          object.key = index;

          // format profile picture objects to JSX img elements
          if (object.profilePicture) {
            object.profilePicture = profilePictureToJSXImg(
              object.profilePicture
            );
          }
        });

        setFriends(res.data?.friends);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const getFriendRequests = () => {
    DAO.getFriendRequests(currentUser?._id, currentUser?.accessToken)
      .then((res) => {
        res.data.friendRequests.forEach((object, index) => {
          object.key = index;
        });

        setFriendRequests(res.data.friendRequests);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const setUserStatusListener = () => {
    socket.on('user:online', (userID) => {
      setFriends((prevState) => {
        return prevState.map((friend) => {
          if (friend._id === userID) {
            return {
              ...friend,
              online: true,
            };
          }
          return friend;
        });
      });
    });
    socket.on('user:offline', (userID) => {
      setFriends((prevState) => {
        return prevState.map((friend) => {
          if (friend._id === userID) {
            return {
              ...friend,
              online: false,
            };
          }
          return friend;
        });
      });
    });
  };

  const setFriendRequestListeners = () => {
    // socket.removeAllListeners('friendrequest:receive');
    // socket.removeAllListeners('friendrequest:cancelreceive');

    socket.on('friendrequest:receive', () => {
      getFriendRequests();
    });

    socket.on('friendrequest:cancelreceive', () => {
      getFriendRequests();
    });
  };

  const setConversationListeners = () => {
    // socket.removeAllListeners('message:receive');

    socket.on('message:receive', ({ fromID, message }) => {
      console.warn('fix this');
      // setFriends((prevState) =>
      //   prevState.map((friend) =>
      //     friend._id === fromID
      //       ? {
      //           ...friend,
      //           conversations: [
      //             {
      //               messages: friend.conversations[0].messages.concat({
      //                 fromID,
      //                 message,
      //                 received: new Date(),
      //               }),
      //             },
      //             ...friend.conversations,
      //           ],
      //         }
      //       : friend
      //   )
      // );
    });
  };

  const setActivityListeners = () => {
    socket.on('activity:receive', (packet) => {
      console.log('received ', packet);
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
  useEffect(() => {
    console.log('found friends ', filteredFriends);
  }, [filteredFriends]);

  const findFriends = (searchTerm) => {
    console.log(
      'searching ',
      friends.filter((friend) =>
        friend.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredFriends(
      searchTerm
        ? friends.filter((friend) =>
            friend.username.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : []
    );
  };

  const value = {
    friends,
    getFriends,
    setFriends,
    findFriends,
    filteredFriends,
    friendRequests,
    getFriendRequests,
    conversations,
    setConversations,
  };

  return (
    <FriendsContext.Provider value={value}>
      {friends && children}
    </FriendsContext.Provider>
  );
}
