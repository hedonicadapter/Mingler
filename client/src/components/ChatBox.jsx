import React, { useEffect, useState, useRef, useMemo } from 'react';
import { css } from '@stitches/react';
import { motion } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize';
import { BsDot } from 'react-icons/bs';

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
  flex: 1,
  fontFamily: 'inherit',
});

const iconContainer = css({
  marginTop: 4,
  paddingRight: 8,
  paddingTop: 4,
});
const sendIcon = css({
  width: 10,
  height: 10,
  borderRadius: '50%',
  backgroundColor: colors.coffeeBlue,
  transition: 'opacity 0.15s ease',
});

const SendButton = ({ inputText, handleSendButton }) => {
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
        {/*
        think of it like a status indicator, indicating that a message is ready to be sent.
        It makes sense because people dont tend to use send buttons for messages anymore,
        rather than just pressing enter 
        */}
        <div className={sendIcon()} style={{ opacity: inputText ? 1 : 0 }} />
      </motion.div>
    </motion.div>
  );
};

const ChatInput = ({
  inputText,
  inputBoxRef,
  settingsFocused,
  error,
  handleInput,
  handleInputKeyDown,
}) => {
  return (
    <TextareaAutosize
      ref={inputBoxRef}
      rows={1}
      maxRows={10}
      autoFocus={settingsFocused ? false : true}
      placeholder="Aa"
      className={inputBox()}
      style={{ color: error ? colors.coffeeRed : colors.darkmodeBlack }}
      value={error ? error : inputText || ''}
      readOnly={error ? true : false}
      onChange={handleInput}
      onKeyDown={handleInputKeyDown}
    />
  );
};

const Dropdown = ({ chatClientSelection, setChatClientSelection }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const defaultChatClient = 'Mingler'; //change to useLocalStorage value later

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
        value="Mingler"
        // onMouseOver={{ color: colors.darkmodeHighWhite }}
      >
        Mingler
      </option>
    </select>
  );
};

export const ChatBox = ({ receiver, expanded }) => {
  const currentUser = useSelector(getCurrentUser);
  const appState = useSelector(getApp);
  const dispatch = useDispatch();

  const { socket } = useClientSocket();
  const { conversations, setConversations, getMessages } = useFriends();

  const anchorRef = useRef();

  const [inputText, setInputText] = useState('');
  const [error, setError] = useState(null);
  const [chatClientSelection, setChatClientSelection] = useState('Mingler');
  // const [defaultChatClient, setDefaultChatClient] = useLocalStorage('defaultChatClient')
  const [scrollTop, setScrollTop] = useState(null);
  const [currentConvo, setCurrentConvo] = useState(null);

  const inputBoxRef = useRef(null);

  useEffect(() => {
    console.log('errorrrrrr ', error);
    const errorTimeout = setTimeout(() => setError(null), 3000);

    return () => clearTimeout(errorTimeout);
  }, [error]);

  useEffect(() => {
    console.log('receiver: ', receiver, 'currentUser: ', currentUser._id);
    console.log(conversations);
    setCurrentConvo(
      conversations?.find((convo) => convo._id === receiver)?.conversation
    );
  }, [conversations]);

  const handleInput = (evt) => {
    setInputText(evt.target.value);
  };

  const handleSendButton = () => {
    sendMessage();
  };

  const sendMessage = async () => {
    if (!inputText || !receiver || inputText === '') return;

    await DAO.sendMessage(
      receiver,
      currentUser?._id,
      inputText,
      new Date(),
      currentUser?.accessToken
    )
      .then((res) => {
        if (res?.data?.success) {
          const newMessage = {
            fromID: currentUser?._id,
            message: inputText,
            sentDate: new Date(),
          };

          socket.emit('message:send', {
            toID: receiver,
            fromID: currentUser?._id,
            messageObject: newMessage,
          });

          setCurrentConvo((prevState) => {
            return {
              ...prevState,
              messages: prevState?.messages?.concat(newMessage),
            };
          });

          // setConversations((prevState) =>
          //   prevState.map((convoObject) =>
          //     convoObject._id === receiver
          //       ? {
          //           ...convoObject,
          //           conversation: {
          //             messages:
          //               convoObject.conversation.messages?.concat(newMessage),
          //           },
          //         }
          //       : { ...convoObject }
          //   )
          // );

          setInputText('');
          inputBoxRef.current?.focus();
          anchorRef.current?.scrollIntoView({ behavior: 'smooth' });
          setError(null);
        }
      })
      .catch((e) => {
        setError(e.response.data.error);
        inputBoxRef.current?.focus();
      });
  };

  const handleInputKeyDown = (evt) => {
    if (evt.key === 'Enter') {
      evt.preventDefault();
      sendMessage();
    }
    // if (evt.key === 'Enter' && evt.key !== 'Shift') {
    //   sendMessage();
    // }
  };

  const handleMessageAreaScroll = (evt) => {
    if (!currentConvo) return;

    if (evt.target.scrollTop === 0) {
      setScrollTop(true);

      getMessages(receiver)
        .then(({ success, error }) => {
          if (success) {
            setError(null);
          }
          if (error) setError(error);
        })
        .catch((e) => {
          console.log(e);
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
        {currentConvo?.messages?.map((message, index) => {
          return (
            <ConversationBubble
              key={index}
              fromID={message.fromID}
              message={message.message}
              sent={message.sentDate}
            />
          );
        })}
        <div ref={anchorRef} />
      </div>
      <div className={inputContainer()}>
        {chatClientSelection === 'Mingler' ? (
          useMemo(
            () => (
              <ChatInput
                inputText={inputText}
                inputBoxRef={inputBoxRef}
                settingsFocused={appState?.settingsFocused}
                error={error}
                handleInput={handleInput}
                handleInputKeyDown={handleInputKeyDown}
              />
            ),
            [inputText, inputBoxRef, appState?.settingsFocused, error]
          )
        ) : (
          <ConnectButton />
        )}
        {/* <Dropdown /> */}
        <SendButton inputText={inputText} handleSendButton={handleSendButton} />
      </div>
    </div>
  );
};
