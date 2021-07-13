import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { css } from '@stitches/react';

import CardHeader from './CardHeader';
import CardBody from './CardBody';

const header = css({
  zIndex: 5,
  paddingBottom: 20,
  // borderBottom: '3px solid rgba(0,0,0,0)',
  backgroundColor: 'rgba(0,0,0,0)',
});

export default function AccordionItem({ friend }) {
  const [expanded, setExpanded] = useState(false);
  const [markyToReplaceWithYouTubeVideo, setMarkyToReplaceWithYouTubeVideo] =
    useState(null);

  const toggleExpansion = () => {
    setExpanded(!expanded);
  };
  return (
    <>
      <motion.header
        whileHover={{
          backgroundColor: expanded ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.075)',
          // borderBottom: '3px solid rgba(0,0,0,0.3)',
        }}
        transition={{ duration: 0.15 }}
        initial={false}
        onClick={() => toggleExpansion()}
        className={header()}
      >
        <CardHeader
          key={friend.key}
          name={friend.Name}
          mainActivity={friend.Activity[0]}
          userID={friend.UserID}
          expanded={expanded}
          markyToReplaceWithYouTubeVideo={markyToReplaceWithYouTubeVideo}
          setMarkyToReplaceWithYouTubeVideo={setMarkyToReplaceWithYouTubeVideo}
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
            <CardBody
              activity={friend.Activity}
              userID={friend.UserID}
              markyToReplaceWithYouTubeVideo={markyToReplaceWithYouTubeVideo}
              setMarkyToReplaceWithYouTubeVideo={
                setMarkyToReplaceWithYouTubeVideo
              }
            />
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
