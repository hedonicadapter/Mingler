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

export default function AccordionItem({ friend, handleNameChange }) {
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
        style={{
          backgroundColor: expanded
            ? 'rgba(36,36,36,1)' //used to be rgba(241,235,232,1)
            : 'rgba(18,18,18, 1)', //used to be rgba(253,245,241, 1)
        }}
        whileHover={{
          backgroundColor: 'rgba(36,36,36,1)', //used to be rgba(241,235,232,1)
        }}
        transition={{ duration: 0.15 }}
        onClick={() => toggleExpansion()}
        className={header()}
      >
        <CardHeader
          key={friend?.key}
          name={friend?.username}
          mainActivity={friend?.activity?.[0]}
          expanded={expanded}
          markyToReplaceWithYouTubeVideo={markyToReplaceWithYouTubeVideo}
          setMarkyToReplaceWithYouTubeVideo={setMarkyToReplaceWithYouTubeVideo}
          handleNameChange={handleNameChange}
          toggleChat={toggleChat}
        />
      </motion.header>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.section
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { height: 'auto', color: 'rgba(0,0,0,1)' },
              collapsed: { height: 0, color: 'rgba(0,0,0,0)' },
            }}
            transition={{ duration: 0.15, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <motion.div
              variants={{
                open: { marginTop: -40 },
                collapsed: { marginTop: 0 },
              }}
            >
              <CardBody
                activity={friend?.activity}
                userID={friend?._id}
                markyToReplaceWithYouTubeVideo={markyToReplaceWithYouTubeVideo}
                setMarkyToReplaceWithYouTubeVideo={
                  setMarkyToReplaceWithYouTubeVideo
                }
                expanded={expanded}
                chatVisible={chatVisible}
              />
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
