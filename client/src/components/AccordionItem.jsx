import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { css } from '@stitches/react';

import CardHeader from './CardHeader';
import CardBody from './CardBody';
import colors from '../config/colors';

const header = css({
  zIndex: 5,
  paddingBottom: 0,
});

export default function AccordionItem({
  username,
  friend,
  isWidgetHeader,
  handleNameChange,
}) {
  const [expanded, setExpanded] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [markyToReplaceWithYouTubeVideo, setMarkyToReplaceWithYouTubeVideo] =
    useState(null);

  const toggleExpansion = () => {
    setExpanded(!expanded);
  };

  const toggleChat = (e) => {
    e.stopPropagation();
    setChatVisible(!chatVisible);

    if (!expanded) {
      toggleExpansion();
    }
  };

  return (
    <>
      <motion.header
        // user.offline ? 'transparent'
        // style={{
        //   backgroundColor: expanded
        //     ? colors.offWhite //used to be rgba(241,235,232,1)
        //     : 'rgba(36,36,36,0)', //transparent used to be rgba(253,245,241, 1)
        // }}
        transition={{ duration: 0.1 }}
        onClick={() => toggleExpansion()}
        className={header()}
      >
        <CardHeader
          key={friend?.key}
          name={username ? username : friend?.username}
          profilePicture={friend?.profilePicture}
          mainActivity={friend?.activity?.[0]}
          expanded={expanded}
          markyToReplaceWithYouTubeVideo={markyToReplaceWithYouTubeVideo}
          setMarkyToReplaceWithYouTubeVideo={setMarkyToReplaceWithYouTubeVideo}
          handleNameChange={handleNameChange}
          toggleChat={toggleChat}
          chatVisible={chatVisible}
          isWidgetHeader={isWidgetHeader}
        />
      </motion.header>
      <AnimatePresence initial={'collapsed'}>
        {expanded && (
          <motion.section
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { height: 'auto', color: colors.offWhite },
              collapsed: { height: 0, color: 'transparent' },
            }}
            transition={{ duration: 0.15, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <CardBody
              activity={friend?.activity}
              userID={friend?._id}
              conversations={friend?.conversations}
              markyToReplaceWithYouTubeVideo={markyToReplaceWithYouTubeVideo}
              setMarkyToReplaceWithYouTubeVideo={
                setMarkyToReplaceWithYouTubeVideo
              }
              expanded={expanded}
              chatVisible={chatVisible}
            />
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
