import { ipcRenderer } from 'electron';
import React, {
  useContext,
  useState,
  useEffect,
  createContext,
  useRef,
} from 'react';
import { useSelector } from 'react-redux';
import { notify } from '../components/reusables/notifications';

import DAO from '../config/DAO';
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
  const { socket, answerYouTubeTimeRequest } = useClientSocket();

  // const [friends, setFriends] = useState([]);
  const [friends, setFriends] = useGetSetFriends([]);
  const [activities, setActivities] = useState({});
  const [conversations, setConversations] = useState(null);
  const [friendRequests, setFriendRequests] = useState(null);
  const [filteredFriends, setFilteredFriends] = useState([]);

  useEffect(() => {
    console.log(friends);
  }, [friends]);

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
    if (!currentUser?.accessToken) return;

    getFriends();
    getConversations();
    getFriendRequests();
  }, [currentUser, socket]);

  useEffect(() => {
    if (!socket || !friends) return;
    setFriendRequestListeners();
    setUserStatusListener();
    setConversationListeners();
    setActivityListeners();
    setYouTubeTimeRequestListeners();
    setChromiumHostDataTimeReplyListeners();
    console.log('this is looping, shouldve kept activities separate');

    // even tho socket is cleaned up with removeAllListeners() in ClientSocketContext.jsx,
    // it isn't cleaned up there every time 'friends' changes
    return () => {
      socket.off('friendrequest:receive', friendRequestReceiveHandler);
      socket.off(
        'friendrequest:cancelreceive',
        friendRequestCancelReceiveHandler
      );
      socket.off('user:online', userOnlineHandler);
      socket.off('user:offline', userOfflineHandler);
      socket.off('message:receive', messageReceiveHandler);
      socket.off('activity:receive', activityReceiveHandler);
      socket.off('youtubetimerequest:receive', setYouTubeTimeRequestHandler);
      ipcRenderer.off(
        'chromiumHostData:YouTubeTime',
        setChromiumHostDataTimeReplyHandler
      );
      socket?.removeAllListeners();
    };
  }, [socket, friends, currentUser?._id]);

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

    return await DAO.getMessages(
      convoObject._id,
      convoObject.messages.length,
      currentUser?.accessToken
    )
      .then((res) => {
        if (res?.data?.success) {
          if (!res.data?.messages) return { success: true };

          addMessagesToConversations(res.data.messages, friendID);

          return { success: true };
        }
      })
      .catch(genericErrorHandler);
  };

  const addMessagesToConversations = (messageArray, friendID) => {
    setConversations((prevState) =>
      prevState.map((convoObject) =>
        convoObject._id === friendID
          ? {
              ...convoObject,
              conversation: {
                ...convoObject?.conversation,
                messages: messageArray.concat(
                  convoObject.conversation.messages
                ),
              },
            }
          : { ...convoObject }
      )
    );
  };

  const deleteFriend = (friendID) => {
    DAO.deleteFriend(currentUser._id, friendID, currentUser.accessToken)
      .then((res) => {
        if (res.data.success) {
          getFriends();
        }
      })
      .catch((e) => {
        notify('Error deleting friend.', e?.response?.data?.error);
      });
  };

  const getFriends = async () => {
    return await DAO.getFriends(currentUser._id, currentUser.accessToken)
      .then((res) => {
        if (res?.data?.success) {
          res.data?.friends.forEach((object, index) => {
            object.key = index;
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
        res.data.friendRequests?.forEach((object, index) => {
          object.key = index;

          // if (object.profilePicture) {
          //   object.profilePicture = profilePictureToJSXImg(
          //     object.profilePicture
          //   );
          // }
        });

        setFriendRequests(res.data.friendRequests);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const setUserStatusListener = () => {
    socket.on('user:online', userOnlineHandler);
    socket.on('user:offline', userOfflineHandler);
  };

  const setFriendRequestListeners = () => {
    // socket.removeAllListeners('friendrequest:receive');
    // socket.removeAllListeners('friendrequest:cancelreceive');

    socket.on('friendrequest:receive', friendRequestReceiveHandler);
    socket.on('friendrequest:cancelreceive', friendRequestCancelReceiveHandler);
  };

  const setConversationListeners = () => {
    socket.on('message:receive', messageReceiveHandler);
  };

  const setActivityListeners = () => {
    socket.on('activity:receive', activityReceiveHandler);
  };

  const setYouTubeTimeRequestListeners = () => {
    // User receives yt time request, and sends get request to ipcMain,
    // which forwards the request through the host to chromium to get the time
    // Packet contains url and tab title to find the right tab
    socket.on('youtubetimerequest:receive', setYouTubeTimeRequestHandler);
  };

  const setChromiumHostDataTimeReplyListeners = () => {
    ipcRenderer.on(
      'chromiumHostData:YouTubeTime',
      setChromiumHostDataTimeReplyHandler
    );
  };

  // TODO: Expand functionality to include favorites
  // and other stuff in the future
  // Update: activities are now automatically sorted by using unshift
  // const sortActivities = (activitiesArray) => {
  //   activitiesArray?.sort((a, b) => {
  //     return new Date(b.Date) - new Date(a.Date);
  //   });
  // };

  const findFriends = (searchTerm) => {
    setFilteredFriends(
      searchTerm
        ? friends.filter((friend) =>
            friend.username.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : []
    );
  };

  const friendRequestReceiveHandler = () => {
    notify('New friend request');
    getFriendRequests();
  };
  const friendRequestCancelReceiveHandler = () => {
    getFriendRequests();
  };

  const userOnlineHandler = (userID) => {
    // TODO:
    // Better way to do this would be to send the friend object through the socket and add it to friends
    // this way is slower and does unnecessary API calls
    getFriends();

    // TODO:
    // Replace with getMessages(userID). Is not appropariate right now because in a use case
    // where a user has just accepted a friend request there is no existing "convoObject"
    getConversations();

    friends?.find((friend) => {
      friend._id === userID &&
        notify(friend.username, 'Now online.', true, friend?.thumbnail);
    });
  };
  const userOfflineHandler = (userID) => {
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
  };

  const messageReceiveHandler = ({ fromID, messageObject }) => {
    let friend = friends?.find((friend) => friend._id === messageObject.fromID);
    notify(friend.username, messageObject.message, false, friend?.thumbnail);

    setConversations((prevState) =>
      prevState.map((convoObject) =>
        convoObject._id === messageObject.fromID
          ? {
              ...convoObject,
              conversation: {
                messages:
                  convoObject.conversation.messages?.concat(messageObject),
              },
            }
          : { ...convoObject }
      )
    );
  };

  const _setActivities = (friendID, newActivity, activityType) => {
    if (!newActivity[activityType]) return;

    setActivities((prevState) => {
      let friendsActivity = prevState[friendID] ? [...prevState[friendID]] : [];

      // Window activities can make duplicates
      if (activityType === 'WindowTitle') {
        let isDuplicate = friendsActivity.some((actvt) => {
          let newWindow = newActivity.WindowTitle;
          let existingTab = actvt.TabTitle;
          let existingYouTube = actvt.YouTubeTitle;
          let existingTrack = actvt.TrackTitle;

          if (existingTab) {
            // TODO: A better way would be a fuzzy search, but this handles cases like
            // browsers displaying the tab name as the window name and appending
            // the tab count with some text
            let existingSubstring = existingTab.substring(0, newWindow.length);
            let newSubstring = newWindow.substring(0, existingTab.length);

            if (
              existingTab.includes(newSubstring) ||
              newWindow.includes(existingSubstring)
            ) {
              return true;
            }
          } else if (existingYouTube) {
            let existingSubstring = existingYouTube.substring(
              0,
              newWindow.length
            );
            let newSubstring = newWindow.substring(0, existingYouTube.length);

            if (
              existingYouTube.includes(newSubstring) ||
              newWindow.includes(existingSubstring)
            ) {
              return true;
            }
          } else if (existingTrack) {
            // TODO: Might change in the future
            // Spotify sets its window title as [artists] - [song title]
            let existingTitle = actvt.TrackTitle;
            let existingArtists = actvt.Artists;
            if (newWindow === ` ${existingArtists} - ${existingTitle}`)
              return true;
          }
        });

        if (isDuplicate) return prevState;
      }

      // Check if an activity of the same type already exists,
      let activityExists = friendsActivity.findIndex(
        (actvt) => actvt[activityType]
      );

      // replace if it does.
      if (activityExists > -1) {
        friendsActivity[activityExists] = newActivity;

        // Move to top, as it's the most recent activity
        friendsActivity.unshift(friendsActivity.splice(activityExists, 1)[0]);
      } else {
        friendsActivity.unshift(newActivity);
      }

      return {
        ...prevState,
        [friendID]: friendsActivity,
      };
    });
  };

  const activityReceiveHandler = (packet) => {
    if (!packet || !packet.data || !packet.userID) return;

    if (packet.data.WindowTitle) {
      _setActivities(packet.userID, packet.data, 'WindowTitle');
    } else if (packet.data.TabTitle) {
      _setActivities(packet.userID, packet.data, 'TabTitle');
    } else if (packet.data.YouTubeTitle) {
      _setActivities(packet.userID, packet.data, 'YouTubeTitle');
    } else if (packet.data.TrackTitle) {
      _setActivities(packet.userID, packet.data, 'TrackTitle');
    }
  };

  const setYouTubeTimeRequestHandler = (packet) => {
    ipcRenderer.send('getYouTubeTime', packet);
  };

  const setChromiumHostDataTimeReplyHandler = (evt, packet) => {
    console.log('friendscontext handler ', packet);

    answerYouTubeTimeRequest(packet?.fromID, packet?.time);
  };

  const value = {
    friends,
    getFriends,
    setFriends,
    findFriends,
    filteredFriends,
    friendRequests,
    getFriendRequests,
    setFriendRequests,
    getConversations,
    deleteFriend,
    activities,
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
