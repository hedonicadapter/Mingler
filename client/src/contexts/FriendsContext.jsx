import { ipcRenderer } from 'electron';
import React, { useContext, useState, useEffect, createContext } from 'react';
import { useSelector } from 'react-redux';
import { notify } from '../components/reusables/notifications';

import DAO from '../config/DAO';
import { profilePictureToJSXImg } from '../helpers/fileManager';
import genericErrorHandler from '../helpers/genericErrorHandler';
import { getCurrentUser } from '../mainState/features/settingsSlice';
import { useClientSocket } from './ClientSocketContext';

const FriendsContext = createContext();
export function useFriends() {
  return useContext(FriendsContext);
}

const useGetSetFriends = (initialValue = []) => {
  const [value, setValue] = useState(initialValue);

  const sortByOnlineBeforeSetting = (newValue) => {
    if (newValue instanceof Array) {
      newValue.sort((a, b) => b.online - a.online);
    }

    setValue(newValue);
  };

  return [value, sortByOnlineBeforeSetting];
};

export function FriendsProvider({ children }) {
  const currentUser = useSelector((state) => getCurrentUser(state));
  const { socket } = useClientSocket();

  // const [friends, setFriends] = useState([]);
  const [friends, setFriends] = useGetSetFriends([]);
  const [conversations, setConversations] = useState(null);
  const [friendRequests, setFriendRequests] = useState(null);
  const [filteredFriends, setFilteredFriends] = useState([]);

  useEffect(() => {
    if (!currentUser?.accessToken) return;

    getFriends();
    getConversations();
    getFriendRequests();
  }, [currentUser, socket]);

  useEffect(() => {
    if (!socket) return;
    setFriendRequestListeners();
    setUserStatusListener();
    setConversationListeners();
    setActivityListeners();

    // socket is cleaned up anyway with removeAllListeners() in ClientSocketContext.jsx?
    return () => {
      // socket.removeAllListeners('friendrequest:receive');
      // socket.removeAllListeners('friendrequest:cancelreceive');
      // socket.removeAllListeners('message:receive');
      // socket.removeAllListeners('activity:receive');
      // socket.removeAllListeners('user:online');
      // socket.removeAllListeners('user:offline');
      socket?.removeAllListeners();
    };
  }, [socket]);

  const getConversations = () => {
    DAO.getConversations(currentUser._id, currentUser.accessToken)
      .then((res) => {
        setConversations(res?.data?.conversationByID?.reverse());
      })
      .catch((e) =>
        notify('Error getting conversations.', e?.response?.data?.error)
      );
  };

  const getMessages = async (friendID) => {
    const convoObject = conversations.find(
      (convo) => convo._id === friendID
    )?.conversation;
    console.log('convoObject ', convoObject);

    return await DAO.getMessages(
      convoObject._id,
      convoObject.messages.length,
      currentUser?.accessToken
    )
      .then((res) => {
        if (!res.data || !res.data?.messages) return;

        if (res?.data?.success) {
          setConversations((prevState) =>
            prevState.map((convoObject) =>
              convoObject._id === friendID
                ? {
                    ...convoObject,
                    conversation: {
                      messages: res.data.messages?.concat(
                        convoObject.conversation.messages
                      ),
                    },
                  }
                : { ...convoObject }
            )
          );

          return { success: true };
        }
      })
      .catch(genericErrorHandler);
  };

  const deleteFriend = (friendID) => {
    DAO.deleteFriend(currentUser._id, friendID, currentUser.accessToken)
      .then((res) => {
        console.log('delete ', res);
        getFriends();
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const getFriends = async () => {
    return await DAO.getFriends(currentUser._id, currentUser.accessToken)
      .then((res) => {
        if (res?.data?.success) {
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
        }
      })
      .catch((e) => {
        notify('Error getting friends.', e?.response?.data?.error);
      });
  };

  const getFriendRequests = () => {
    DAO.getFriendRequests(currentUser?._id, currentUser?.accessToken)
      .then((res) => {
        console.log('friend requests ', res);
        res.data.friendRequests?.forEach((object, index) => {
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
      // TODO:
      // Better way to do this would be to send the friend object through the socket and add it to friends
      // this way is slower and does unnecessary API calls
      getFriends();

      // TODO:
      // Replace with getMessages(userID). Is not appropariate right now because in a use case
      // where a user has just accepted a friend request there is no existing "convoObject"
      getConversations();

      friends?.find((friend) => {
        friend._id === userID && notify(friend.username, 'Now online.');
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
      notify('New friend request');
      getFriendRequests();
    });

    socket.on('friendrequest:cancelreceive', () => {
      getFriendRequests();
    });
  };

  const setConversationListeners = () => {
    socket.on('message:receive', ({ fromID, message }) => {
      notify(
        friends?.find((friend) => friend._id === fromID),
        message
      );

      setConversations((prevState) =>
        prevState.map((convoObject) =>
          convoObject._id === receiver
            ? {
                ...convoObject,
                conversation: {
                  messages: convoObject.conversation.messages?.concat(message),
                },
              }
            : { ...convoObject }
        )
      );
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
    getConversations,
    deleteFriend,
    conversations,
    getMessages,
    setConversations,
  };

  return (
    <FriendsContext.Provider value={value}>
      {friends && children}
    </FriendsContext.Provider>
  );
}
