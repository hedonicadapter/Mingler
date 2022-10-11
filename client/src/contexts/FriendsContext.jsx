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

  const [friends, setFriends] = useGetSetFriends([]);

  const [conversations, setConversations] = useState(null);
  const [friendRequests, setFriendRequests] = useState(null);
  const [filteredFriends, setFilteredFriends] = useState([]);

  useEffect(() => {
    ipcRenderer.send('friends:fromrenderer', friends);
  }, [friends]);

  useEffect(() => {
    if (!currentUser?.accessToken) return;

    getFriends();
    getConversations();
    getFriendRequests();
  }, [currentUser]);

  useEffect(() => {
    if (!friends) return;
    setFriendRequestListeners();
    setUserStatusListener();
    setConversationListeners();
    setYouTubeTimeRequestListeners();

    return () => {
      ipcRenderer.removeAllListeners(
        'friendrequest:receive:fromMain',
        friendRequestReceiveHandler
      );
      ipcRenderer.removeAllListeners(
        'friendrequest:cancelreceive:fromMain',
        friendRequestCancelReceiveHandler
      );
      ipcRenderer.removeAllListeners('user:online:fromMain', userOnlineHandler);
      ipcRenderer.removeAllListeners(
        'user:offline:fromMain',
        userOfflineHandler
      );
      ipcRenderer.removeAllListeners(
        'message:receive:fromMain',
        messageReceiveHandler
      );
      ipcRenderer.removeAllListeners(
        'youtubetimerequest:receive:fromMain',
        setYouTubeTimeRequestHandler
      );
    };
  }, [friends, currentUser?._id]);

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
    ipcRenderer.on('user:online:fromMain', userOnlineHandler);
    ipcRenderer.on('user:offline:fromMain', userOfflineHandler);
  };

  const setFriendRequestListeners = () => {
    ipcRenderer.on(
      'friendrequest:receive:fromMain',
      friendRequestReceiveHandler
    );
    ipcRenderer.on(
      'friendrequest:cancelreceive:fromMain',
      friendRequestCancelReceiveHandler
    );
  };

  const setConversationListeners = () => {
    ipcRenderer.on('message:receive:fromMain', messageReceiveHandler);
  };

  const setYouTubeTimeRequestListeners = () => {
    // User receives yt time request, and sends get request to ipcMain,
    // which forwards the request through the host to chromium to get the time
    // Packet contains url and tab title to find the right tab
    ipcRenderer.on(
      'youtubetimerequest:receive:fromMain',
      setYouTubeTimeRequestHandler
    );
  };

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

  const userOnlineHandler = (e, userID) => {
    // TODO:
    // Better way to do this would be to send the friend object through the socket and add it to friends
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
  const userOfflineHandler = (evt, userID) => {
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

  const messageReceiveHandler = (e, { fromID, messageObject }) => {
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

  const setYouTubeTimeRequestHandler = (e, packet) => {
    ipcRenderer.send('getYouTubeTime', packet);
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
