import React, { useEffect, useState, useRef } from 'react';
import { css } from '@stitches/react';
import { motion } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize';
import { MdSend } from 'react-icons/md';

import colors from '../config/colors';
import { useClientSocket } from '../contexts/ClientSocketContext';
import { useFriends } from '../contexts/FriendsContext';
import DAO from '../config/DAO';
import { ConversationBubble } from './ConversationBubble';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from '../mainState/features/settingsSlice';
import { getApp } from '../mainState/features/appSlice';

const ConnectButton = () => {
  const [chatClientPopUpOpen, setChatClientPopUpOpen] = useState(false);
  const [connectChatClientPopUpWindow, setConnectChatClientPopupWindow] =
    useState(new BrowserWindow(connectChatClientPopUpConfig));

  const connectButtonContainer = css({
    flex: 1,
    color: colors.darkmodeMediumWhite,
    fontWeight: 'bold',
    fontSize: '0.8em',
    cursor: 'pointer',
    borderRadius: 3,
  });

  const connectChatClientPopUp = (chosenClient) => {
    connectChatClientPopUpWindow.setResizable(true);
    if (!chatClientPopUpOpen) {
      connectChatClientPopUpWindow.on('close', function () {
        setConnectChatClientPopupWindow(null);
      });
      connectChatClientPopUpWindow.on('closed', function () {
        setConnectChatClientPopupWindow(
          new BrowserWindow(connectChatClientPopUpConfig)
        );
        setChatClientPopUpOpen(false);
      });
      connectChatClientPopUpWindow.loadURL(
        `file://${app.getAppPath()}/index.html#/connectChatClient`
      );

      connectChatClientPopUpWindow.once('ready-to-show', () => {
        connectChatClientPopUpWindow.webContents.send('chosenClient', {
          chosenClient,
          email: currentUser?.email,
          accessToken: currentUser?.accessToken,
          userID: currentUser?._id,
        });

        connectChatClientPopUpWindow.show();
        setChatClientPopUpOpen(true);
      });
    } else connectChatClientPopUpWindow.focus();
  };

  return (
    <div
      className={connectButtonContainer()}
      onClick={() => connectChatClientPopUp(chatClientSelection)}
    >
      Connect
    </div>
  );
};

const chatContainer = css({
  borderRadius: '5px',
  borderColor: 'grey',
  display: 'flex',
  flexDirection: 'column',
  maxHeight: 200,
  padding: 10,
  zIndex: 200,
});
const messageArea = css({
  overflowY: 'scroll',
  overflowX: 'hidden',
  flex: 1,
  // height: 300,
  marginBottom: 4,

  scrollSnapType: 'y proximity',

  '&> div > div:last-child': {
    scrollSnapAlign: 'end',
  },
});
const inputContainer = css({
  borderTop: '1px solid ' + colors.offWhitePressed2,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 6,
});
const inputBox = css({
  border: 'none',
  outline: 'none',
  resize: 'none',
  backgroundColor: 'transparent',
  paddingTop: 8,
  marginLeft: 4,
  marginRight: 4,
  color: colors.darkmodeBlack,
  flex: 1,
  fontFamily: 'inherit',
});

export const ChatBox = ({ receiver, conversations, expanded }) => {
  const currentUser = useSelector(getCurrentUser);
  const appState = useSelector(getApp);
  const dispatch = useDispatch();

  const { socket } = useClientSocket();
  const { setFriends } = useFriends();

  const anchorRef = useRef();

  const [nativeConversations, setNativeConversations] = useState();
  const [inputText, setInputText] = useState('');
  const [chatClientSelection, setChatClientSelection] = useState('ShareHub');
  // const [defaultChatClient, setDefaultChatClient] = useLocalStorage('defaultChatClient')
  const [scrollTop, setScrollTop] = useState(null);

  const inputBoxRef = useRef(null);

  const handleInput = (evt) => {
    setInputText(evt.target.value);
  };

  const Dropdown = () => {
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const defaultChatClient = 'ShareHub'; //change to useLocalStorage value later

    const chatClientDropdown = css({
      marginRight: 8,
      border: 'none',
      outline: 'none',
      backgroundColor: colors.darkmodeBlack,
      color: dropdownVisible
        ? colors.darkmodeMediumWhite
        : colors.darkmodeLightBlack,
      fontWeight: 'bold',
      marginTop: 6,
      padding: 3,
      paddingRight: 5,
      transition: 'color .15 ease',
      borderRadius: '2px',
      boxShadow: 'none',
    });
    const dropdownItem = css({
      outline: 'none',
    });

    const handleChatClientSelection = (evt) => {
      setChatClientSelection(evt.target.value);
    };

    const toggleChatClientDropdown = () => {
      setDropdownVisible(!dropdownVisible);
    };

    return (
      <select
        onClick={toggleChatClientDropdown}
        className={chatClientDropdown()}
        value={chatClientSelection}
        onChange={handleChatClientSelection}
      >
        <option
          className={dropdownItem()}
          value="Discord"
          // onMouseOver={{ color: colors.darkmodeHighWhite }}
        >
          Discord
        </option>
        <option
          disabled
          className={dropdownItem()}
          value="Messenger"
          // onMouseOver={{ color: colors.darkmodeHighWhite }}
        >
          Messenger
        </option>
        <option
          className={dropdownItem()}
          value="ShareHub"
          // onMouseOver={{ color: colors.darkmodeHighWhite }}
        >
          ShareHub
        </option>
      </select>
    );
  };

  const sendMessage = () => {
    if (!inputText || !receiver || inputText === '') return;
    socket.emit('message:send', {
      toID: receiver,
      fromID: currentUser?._id,
      message: inputText,
    });

    const newMessage = {
      fromID: currentUser?._id,
      message: inputText,
      createdAt: new Date(),
    };

    setFriends((prevState) =>
      prevState.map((f) =>
        f._id === receiver
          ? {
              ...f,
              conversations: [
                { messages: f.conversations[0].messages.concat(newMessage) },
                ...f.conversations,
              ],
            }
          : f
      )
    );

    DAO.sendMessage(
      receiver,
      currentUser?._id,
      inputText,
      currentUser?.accessToken
    )
      .then((res) => {
        setInputText('');
        inputBoxRef.current?.focus();
        anchorRef.current?.scrollIntoView({ behavior: 'smooth' });
      })
      .catch((e) => {
        console.error(e);
        inputBoxRef.current?.focus();
      });
  };

  const handleInputKeyUp = (evt) => {
    // console.log('keys: ', evt.key);

    console.log('key pressed: ', evt.key);
    console.log('shiftKey: ', evt.shiftKey);
    // if (evt.key === 'Enter' && evt.key !== 'Shift') {
    //   sendMessage();
    // }
  };

  const handleInputKeyDown = (evt) => {
    // if (evt.key === 'Enter' && !evt.key === 'Shift') {
    //   evt.preventDefault();
    // }
  };

  const SendButton = () => {
    const iconContainer = css({
      marginTop: 8,
    });

    const sendIcon = css({
      width: 22,
      height: 22,
      transition: 'opacity 0.15s ease',
      opacity: inputText ? 1 : 0,
    });

    const handleSendButton = () => {
      sendMessage();
    };

    return (
      <motion.div
        className={iconContainer()}
        whileHover={{ cursor: inputText ? 'pointer' : 'auto' }}
        onClick={handleSendButton}
      >
        <motion.div
          animate={inputText ? 'true' : 'false'}
          variants={{ true: { opacity: 1 }, false: { opacity: 0 } }}
          transition={{ duration: 0.15 }}
        >
          <MdSend color={colors.samBlue} className={sendIcon()} />
        </motion.div>
      </motion.div>
    );
  };

  const handleMessageAreaScroll = (evt) => {
    if (evt.target.scrollTop === 0) {
      setScrollTop(true);
      const skip = conversations[0].messages.length;
      DAO.getMessages(conversations[0]._id, skip, currentUser?.accessToken)
        .then((res) => {
          if (!res.data.messages) return;

          setFriends((prevState) =>
            prevState.map((f) =>
              f._id === receiver
                ? {
                    ...f,
                    conversations: [
                      {
                        ...f.conversations[0],
                        messages: [
                          ...res.data.messages,
                          ...f.conversations[0].messages,
                        ],
                      },
                    ],
                  }
                : f
            )
          );
        })
        .catch((e) => {
          console.error(e);
        });
    } else setScrollTop(false);
  };

  useEffect(() => {
    if (scrollTop) return;
    anchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [anchorRef]);

  return (
    <div className={chatContainer()}>
      <div className={messageArea()} onScroll={handleMessageAreaScroll}>
        {conversations[0]?.messages?.map((message, index) => {
          return (
            <motion.div
              key={index}
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ConversationBubble
                fromID={message.fromID}
                message={message.message}
                sent={message.createdAt}
              />
            </motion.div>
          );
        })}
        <div ref={anchorRef} />
      </div>
      <div className={inputContainer()}>
        {chatClientSelection === 'ShareHub' ? (
          <TextareaAutosize
            ref={inputBoxRef}
            maxRows={10}
            autoFocus={appState?.settingsFocused ? false : true}
            placeholder="Aa"
            rows={1}
            className={inputBox()}
            value={inputText}
            onChange={handleInput}
            onKeyUp={handleInputKeyUp}
            onKeyDown={handleInputKeyDown}
          />
        ) : (
          <ConnectButton />
        )}
        {/* <Dropdown /> */}
        <SendButton />
      </div>
    </div>
  );
};
