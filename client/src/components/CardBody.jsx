import React, { useState, useRef, useEffect } from 'react';
import { css } from '@stitches/react';
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion';
import { Flipper, Flipped } from 'react-flip-toolkit';
import ReactPlayer from 'react-player/youtube';
import TextareaAutosize from 'react-textarea-autosize';

import { MdSend } from 'react-icons/md';

import colors from '../config/colors';
import Marky from './Marky';
import { useLocalStorage } from '../helpers/localStorageManager';
import { useAuth } from '../contexts/AuthContext';
import { useClientSocket } from '../contexts/ClientSocketContext';
import DAO from '../config/DAO';

const electron = require('electron');
const BrowserWindow = electron.remote.BrowserWindow;
const app = electron.remote.app;

const flipper = css({
  height: '100%',
  backgroundColor: colors.darkmodeLightBlack,
  // marginTop: -16, // the Flipper component has some inherent top margin
  // marginLeft: -25,
  // paddingBottom: 1,
});
const markyContainer = css({
  marginLeft: -30,
  padding: 6,
});

const connectChatClientPopUpConfig = {
  show: false,
  frame: true,
  transparent: true,
  resizable: true,
  width: 480,
  webPreferences: {
    nodeIntegration: true,
    enableRemoteModule: true,
  },
};

const ChatBox = ({ receiver, conversations }) => {
  console.log('conversations ', conversations);
  const { socket } = useClientSocket();
  const { currentUser, token } = useAuth();

  const [inputText, setInputText] = useState(null);
  const [chatClientSelection, setChatClientSelection] = useState('ShareHub');
  // const [defaultChatClient, setDefaultChatClient] = useLocalStorage('defaultChatClient')

  const inputBoxRef = useRef();

  const ScrollAnchor = () => {
    const anchorRef = useRef();

    useEffect(
      () => anchorRef.current?.scrollIntoView({ behavior: 'smooth' }),
      [anchorRef]
    );
    return <div ref={anchorRef}></div>;
  };

  const chatContainer = css({
    borderRadius: '5px',
    borderColor: 'grey',
    display: 'flex',
    flexDirection: 'column',
    height: 200,
    padding: 10,
    marginLeft: -40,
    zIndex: 200,
  });
  const messageArea = css({
    overflowY: 'scroll',
    overflowX: 'hidden',
    marginRight: -8,
    flex: 1,
    height: 300,
    marginBottom: 8,

    scrollSnapType: 'y proximity',

    '&> div > div:last-child': {
      scrollSnapAlign: 'end',
    },
    // display: 'flex',
    // flexDirection: 'column-reverse',
  });
  const inputContainer = css({
    borderTop: '1px solid #121212',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  });
  const inputBox = css({
    border: 'none',
    outline: 'none',
    resize: 'none',
    backgroundColor: 'transparent',
    paddingTop: 8,
    marginLeft: 4,
    marginRight: 4,
    color: colors.darkmodeHighWhite,
    flex: 1,
  });

  const handleInput = (evt) => {
    setInputText(evt.target.value);
  };

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
        // FindFriendsPopUp window

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
            token,
            userID: currentUser._id,
          });

          connectChatClientPopUpWindow.show();
          setChatClientPopUpOpen(true);
        });
      } else connectChatClientPopUpWindow.focus();
    };

    return (
      <motion.div
        className={connectButtonContainer()}
        onClick={() => connectChatClientPopUp(chatClientSelection)}
      >
        Connect
      </motion.div>
    );
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
        defaultValue={defaultChatClient}
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

  const SendButton = () => {
    const iconContainer = css({
      marginTop: 8,
    });
    const sendIcon = css({
      width: 22,
      height: 22,
    });

    const handleSendButton = () => {
      if (!inputText || !receiver) return;
      socket.emit('message:send', {
        toID: receiver,
        fromID: currentUser._id,
        message: inputText,
      });
      DAO.sendMessage(receiver, currentUser._id, inputText, token)
        .then((res) => {
          setInputText('');
          inputBoxRef.current?.focus();
        })
        .catch((e) => {
          console.error(e);
          inputBoxRef.current?.focus();
        });
    };

    return (
      <motion.div
        className={iconContainer()}
        whileHover={{ cursor: inputText ? 'pointer' : 'auto' }}
        onClick={handleSendButton}
      >
        <MdSend
          color={inputText ? colors.samBlue : colors.darkmodeBlack}
          className={sendIcon()}
        />
      </motion.div>
    );
  };

  const ConversationBubble = ({ fromID, message, sent }) => {
    const sentByMe = fromID === currentUser._id;

    const bubbleContainer = css({
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      padding: 4,
    });
    const bubble = css({
      backgroundColor: sentByMe ? colors.nudeBloo : colors.darkmodeMediumWhite,
      borderRadius: '15px',
      marginRight: 8,
    });
    const conversationText = css({
      margin: 0,
      padding: 10,
      maxWidth: '100%',
      wordWrap: 'break-all',
      whiteSpace: 'break-spaces',
      textOverflow: ' ',

      fontSize: '0.8em',
    });
    const sentTime = css({
      color: colors.darkmodeDisabledWhite,
      padding: 8,
      fontSize: '0.6em',
    });

    return (
      <div className={bubbleContainer()}>
        {sentByMe ? (
          <>
            <div className={sentTime()}>
              {new Date(sent).toLocaleTimeString('en-US', {
                timeStyle: 'short',
              })}
            </div>
            <div className={bubble()}>
              <p className={conversationText()}>{message}</p>
            </div>
          </>
        ) : (
          <>
            <div className={bubble()}>
              <p className={conversationText()}>{message}</p>
            </div>
            <div className={sentTime()}>
              {new Date(sent).toLocaleTimeString('en-US', {
                timeStyle: 'short',
              })}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <motion.div className={chatContainer()}>
      <div className={messageArea()}>
        {conversations[0]?.users?.includes(receiver) &&
          conversations[0]?.messages?.map((message) => {
            console.log('wtf ', message);
            return (
              <motion.div
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
        <ScrollAnchor />
      </div>
      <div className={inputContainer()}>
        {chatClientSelection === 'ShareHub' ? (
          <TextareaAutosize
            ref={inputBoxRef}
            maxRows={10}
            autoFocus
            placeholder="Aa"
            rows={1}
            className={inputBox()}
            value={inputText}
            onChange={handleInput}
          />
        ) : (
          <ConnectButton />
        )}
        <Dropdown />
        <SendButton />
      </div>
    </motion.div>
  );
};

export default function CardBody({
  activity,
  userID,
  expanded,
  chatVisible,
  conversations,
}) {
  return (
    <>
      <div className={flipper()}>
        <motion.ul layout>
          {activity?.map((activity, index) => (
            <motion.div layout className={markyContainer()}>
              <Marky
                {...activity}
                userID={userID}
                marKey={index}
                expanded={expanded}
              />
            </motion.div>
          ))}
          <AnimatePresence>
            {chatVisible && (
              <motion.div
                initial={{ opacity: 0, y: -800 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -800 }}
                transition={{ duration: 0.15 }}
              >
                <ChatBox receiver={userID} conversations={conversations} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.ul>
      </div>
    </>
  );
}
