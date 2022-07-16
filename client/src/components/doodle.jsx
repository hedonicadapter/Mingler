import React, { useState, useRef, useEffect } from 'react';

import { AnimatePresence, AnimateSharedLayout, motion } from 'framer-motion';

const friends = [1, 2, 3, 4, 5, 6, 7, 8];

export const EmptySpaceFiller = ({}) => {
  return (
    <div
      style={{ flex: '1 1 auto', backgroundColor: colors.offWhite, zIndex: 60 }}
    />
  );
};

const AccordionItem = () => {
  const [expanded, setExpanded] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [playerVisible, setPlayerVisible] = useState(false);

  const toggleExpansion = (evt) => {
    evt?.stopPropagation();
    setExpanded(!expanded);
  };

  const toggleChat = (e) => {
    e.stopPropagation();
    setChatVisible(!chatVisible);

    if (!expanded) {
      toggleExpansion();
    }
  };

  const togglePlayer = () => {
    setPlayerVisible(!playerVisible);

    if (!expanded) {
      toggleExpansion();
    }
  };

  const closePlayer = () => {
    setPlayerVisible(false);
  };

  return (
    <motion.div>
      <motion.header
        style={{
          zIndex: 5,
          backgroundColor: expanded
            ? 'rgba(241,235,232,255)'
            : 'rgba(253,245,241,1)',
        }}
        onClick={toggleExpansion}
      >
        <div>
          {/* CardHeader start */}
          <div>
            <div>
              <div style={{ float: 'left', paddingRight: '12px' }}>
                {/* AvatarContainer start */}
                <motion.div>
                  <Avatar name={'whatup'} size={'58'} round />
                </motion.div>
              </div>
              <div style={{ marginLeft: 20, paddingRight: 20 }}>
                Marky
                <AnimatePresence>
                  {expanded && (
                    <div>
                      marky <br /> marky <br /> marky
                    </div>
                  )}
                </AnimatePresence>
                <div style={{ height: 10 }} />
              </div>
            </div>
          </div>
          {/* Chat button */}
          <div
            style={{
              position: 'absolute',
              right: 16,
              top: '25%',
              bottom: '75%',
              float: 'right',
              verticalAlign: 'middle',
              lineHeight: '100%',
            }}
            onClick={(e) => toggleChat(e)}
          >
            <div
              style={{
                color: expanded
                  ? chatVisible
                    ? colors.darkmodeLightBlack
                    : colors.darkmodeBlack
                  : colors.darkmodeBlack,

                opacity: cardHovered ? 0.6 : 0,
              }}
            >
              Toggle chat
            </div>
          </div>
        </div>
      </motion.header>
      {expanded && (
        <motion.section>
          {/* CardBody start */}
          <motion.div
            layout
            style={{ backgroundColor: colors.offWhiteHovered }}
          >
            <AnimatePresence>
              {playerVisible && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    padding: 10,
                    paddingTop: 2,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <motion.div
                    whileHover={{
                      opacity: 0.86,
                    }}
                    transition={{ duration: 0.1 }}
                  ></motion.div>

                  <div> player </div>
                </motion.div>
              )}
            </AnimatePresence>
            {chatVisible && (
              // ChatBox start
              <motion.div
                style={{
                  borderRadius: 5,
                  borderColor: 'grey',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: 200,
                  padding: 10,
                  zIndex: 200,
                }}
              >
                <div
                  style={{
                    overflowY: 'scroll',
                    overflowX: 'hidden',
                    flex: 1,
                    marginBottom: 4,
                    scrollSnapType: 'proximity',
                  }}
                >
                  <motion.div>Conversation bubbles</motion.div>
                </div>
                {/* Inputcontainer */}
                <div
                  style={{
                    borderTop: '1px solid ' + colors.offWhitePressed2,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 6,
                  }}
                >
                  <TextareaAutosize
                    rows={1}
                    maxRows={10}
                    placeholder="Aa"
                    style={{
                      border: 'none',
                      outline: 'none',
                      resize: 'none',
                      backgroundColor: 'transparent',
                      paddingTop: 8,
                      marginLeft: 4,
                      marginRight: 4,
                      flex: 1,
                      fontFamily: 'inherit',
                    }}
                    value={''}
                  />
                  <motion.div>
                    <motion.div>
                      {/*
        think of it like a status indicator, indicating that a message is ready to be sent.
        It makes sense because people dont tend to use send buttons for messages anymore,
        rather than just pressing enter 
        */}
                      <div>Send</div>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.section>
      )}
    </motion.div>
  );
};

export default function FriendsList() {
  return (
    <>
      <div
        style={{
          display: 'flex',
          flexFlow: 'column',
          height: '100vh',
          backgroundColor: 'transparent',
        }}
        spellCheck="false"
      >
        <div style={{ flex: '0 1 auto' }}>
          <AccordionItem />
        </div>
        <div style={{ overflowY: 'auto', scrollbarGutter: 'stable' }}>
          {friends.map((friend, index) => (
            <AccordionItem key={index} />
          ))}
        </div>

        <EmptySpaceFiller />
        {/* <div style={{ flex: '0 1 40px' }}>
          <WidgetFooter
            handleSearchInput={handleSearchInput}
            searchValue={appState?.findFriendsSearchValue}
            friends={friends}
          />
        </div> */}
      </div>
    </>
  );
}
