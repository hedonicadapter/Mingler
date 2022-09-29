import React, { useEffect, useState, useRef, useMemo } from 'react';
import { AnimatePresence, AnimateSharedLayout, motion } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize';
import { BsDot } from 'react-icons/bs';

import colors from '../config/colors';
import styles from './ChatBox.module.css';
import { useClientSocket } from '../contexts/ClientSocketContext';
import { useFriends } from '../contexts/FriendsContext';
import DAO from '../config/DAO';
import { ConversationBubble } from './ConversationBubble';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from '../mainState/features/settingsSlice';
import { getApp } from '../mainState/features/appSlice';
import { LoadingAnimation } from './reusables/LoadingAnimation';

const ConnectButton = () => {
  const [chatClientPopUpOpen, setChatClientPopUpOpen] = useState(false);
  const [connectChatClientPopUpWindow, setConnectChatClientPopupWindow] =
    useState(new BrowserWindow(connectChatClientPopUpConfig));

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
      className={styles.connectButtonContainer}
      onClick={() => connectChatClientPopUp(chatClientSelection)}
    >
      Connect
    </div>
  );
};

const SendButton = ({ inputText, handleSendButton }) => {
  return (
    <motion.div
      className={styles.iconContainer}
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
        <div
          className={styles.sendIcon}
          style={{ opacity: inputText ? 1 : 0 }}
        />
      </motion.div>
    </motion.div>
  );
};

const ChatInput = ({
  chatVisible,
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
      className={styles.inputBox}
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

  const handleChatClientSelection = (evt) => {
    setChatClientSelection(evt.target.value);
  };

  const toggleChatClientDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  return (
    <select
      onClick={toggleChatClientDropdown}
      className={styles.chatClientDropdown}
      style={{
        color: dropdownVisible
          ? colors.darkmodeMediumWhite
          : colors.darkmodeLightBlack,
      }}
      value={chatClientSelection}
      onChange={handleChatClientSelection}
    >
      <option
        className={styles.dropdownItem}
        value="Discord"
        // onMouseOver={{ color: colors.darkmodeHighWhite }}
      >
        Discord
      </option>
      <option
        disabled
        className={styles.dropdownItem}
        value="Messenger"
        // onMouseOver={{ color: colors.darkmodeHighWhite }}
      >
        Messenger
      </option>
      <option
        className={styles.dropdownItem}
        value="Mingler"
        // onMouseOver={{ color: colors.darkmodeHighWhite }}
      >
        Mingler
      </option>
    </select>
  );
};

export const ChatBox = ({ receiver, chatVisible }) => {
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
  const [loading, setLoading] = useState(false);

  const inputBoxRef = useRef(null);

  useEffect(() => {
    console.log('errorrrrrr ', error);
    const errorTimeout = setTimeout(() => setError(null), 3000);

    return () => clearTimeout(errorTimeout);
  }, [error]);

  useEffect(() => {
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

              messages: prevState?.messages
                ? prevState?.messages?.concat(newMessage)
                : [newMessage],
            };
          });

          setInputText('');
          inputBoxRef.current?.focus();
          anchorRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest',
          });
          setError(null);
        }
      })
      .catch((e) => {
        setError(e?.response?.data?.error);
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

      setLoading(true);
      getMessages(receiver)
        .then(({ success, error }) => {
          setLoading(false);
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
    anchorRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    });
  }, [anchorRef]);

  return (
    <motion.div
      style={{ overflow: 'hidden' }}
      animate={chatVisible ? 'show' : 'hide'}
      initial={'hide'}
      variants={{
        show: { height: 'auto' },
        hide: { height: 0 },
      }}
      transition={{ duration: 0.15 }}
    >
      <motion.div
        // layout="position"
        className={styles.chatContainer}
      >
        <div className={styles.messageArea} onScroll={handleMessageAreaScroll}>
          <AnimateSharedLayout>
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 25 }}
                  exit={{ opacity: 0, height: 0, transition: { delay: 0.25 } }}
                  transition={{ duration: 0.25 }}
                >
                  <LoadingAnimation
                    formFilled={'loading'}
                    style={{
                      position: 'relative',
                      zIndex: 50,
                      left: '50%',
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            {currentConvo?.messages?.map((message, index) => (
              <ConversationBubble
                index={message.sentDate}
                fromID={message.fromID}
                message={message.message}
                sent={message.sentDate}
              />
            ))}
          </AnimateSharedLayout>
          <div ref={anchorRef} />
        </div>
        <div className={styles.inputAndSendButtonContainer}>
          <motion.div
            className={styles.inputContainer}
            style={{ borderTop: '1px solid' + colors.offWhitePressed2 }}
          >
            {useMemo(
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
            )}
          </motion.div>
          <SendButton
            inputText={inputText}
            handleSendButton={handleSendButton}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};
