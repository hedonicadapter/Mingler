import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { css } from '@stitches/react';

import { IoChatbubblesOutline } from 'react-icons/io5';

import CardHeader from './CardHeader';
import CardBody from './CardBody';
import colors from '../config/colors';
import Marky from './Marky';

const header = css({
  zIndex: 5,
});

const OnlineStatusIndicator = ({ activityLength, isWidgetHeader }) => {
  return (
    <motion.span
      style={{
        pointerEvents: 'none',
        position: 'relative',
      }}
    >
      <span
        style={{
          zIndex: 80,
          position: 'absolute',
          height: '50px',
          width: '50px',
          backgroundColor: colors.samBlue,
          clipPath: 'circle(9px at 36px)',
          display: 'inline-block',
          minHeight: activityLength >= 2 ? 104 : 84,
          paddingTop: isWidgetHeader ? 35 : 28,
        }}
      />
    </motion.span>
  );
};

const CardSeparator = ({ cardHovered, expanded }) => {
  const separatorContainer = css({
    zIndex: 80,
    position: 'relative',
  });
  const separator = css({
    position: 'absolute',
    // height: '2px',
    outline: '1px solid ' + colors.offWhiteHovered,
    width: '100%',
    // backgroundColor: colors.offWhiteHovered,
    transition: 'opacity 0.15s ease',
    filter: 'blur(1px)',
  });

  return (
    <div className={separatorContainer()}>
      <div
        className={separator()}
        style={{
          opacity: cardHovered ? (expanded ? 0 : 1) : 0,
        }}
      />
    </div>
  );
};

export default function AccordionItem({
  username,
  friend,
  isWidgetHeader,
  handleNameChange,
  expandedMasterToggle,
}) {
  const [expanded, setExpanded] = useState(false);
  const [cardHovered, setCardHovered] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [markyToReplaceWithYouTubeVideo, setMarkyToReplaceWithYouTubeVideo] =
    useState(null);
  const [activityLength, setActivityLength] = useState(null);

  const cardHeaderRef = useRef(null);

  useEffect(() => {
    setActivityLength(friend?.activity?.length);
  }, [friend]);

  useEffect(() => {
    setExpanded(false);
  }, [expandedMasterToggle]);

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

  const messageIcon = css({
    transform: 'scaleX(-1)',
    height: 26,
    width: 26,
    transition: 'color 0.15s ease',
    transition: 'opacity 0.15s ease',

    color: expanded
      ? chatVisible
        ? colors.darkmodeLightBlack
        : colors.darkmodeBlack
      : colors.darkmodeBlack,

    opacity: cardHovered ? 1 : 0,
    '&:hover': {
      color: colors.darkmodeBlack,
    },
    '&:active': {
      color: colors.offWhitePressed,
    },
  });

  return (
    <>
      {!isWidgetHeader && friend?.online && (
        <OnlineStatusIndicator
          activityLength={activityLength}
          isWidgetHeader={isWidgetHeader}
        />
      )}
      <motion.header
        // user.offline ? 'transparent'
        style={{
          // margin: 'auto',
          position: 'relative',
          // display: 'flex',
          // flexDirection: 'row',
          // height: '120px',
          // height: expanded ? '120px' : '90px',
          // paddingTop: '55px',
          // paddingBottom: '55px',
          // height: expanded ? cardHeaderRef.current?.clientHeight + 10 : 84,
          minHeight: activityLength >= 2 ? 104 : 84,
          backgroundColor: expanded ? colors.offWhiteHovered : colors.offWhite,
          WebkitMask: isWidgetHeader
            ? 'none'
            : !friend?.online &&
              'radial-gradient(circle 9px at 36px 50%,transparent 88%,#fff)',
          // backgroundColor: expanded
          //   ? colors.offWhite //used to be rgba(241,235,232,1)
          //   : 'rgba(36,36,36,0)', //transparent used to be rgba(253,245,241, 1)
          paddingLeft: isWidgetHeader ? 23 : 54,
          paddingTop: isWidgetHeader ? 35 : 28,
          // paddingBottom: expanded ? 24 : 0,
        }}
        onClick={toggleExpansion}
        className={header()}
        onMouseEnter={() => setCardHovered(true)}
        onMouseLeave={() => setCardHovered(false)}
      >
        <CardHeader
          cardHeaderRef={cardHeaderRef}
          online={friend?.online}
          key={friend?.key}
          name={username ? username : friend?.username}
          profilePicture={friend?.profilePicture}
          userID={friend?._id}
          mainActivity={friend?.activity?.[0]}
          activity={friend?.activity}
          expanded={expanded}
          markyToReplaceWithYouTubeVideo={markyToReplaceWithYouTubeVideo}
          setMarkyToReplaceWithYouTubeVideo={setMarkyToReplaceWithYouTubeVideo}
          handleNameChange={handleNameChange}
          toggleChat={toggleChat}
          chatVisible={chatVisible}
          isWidgetHeader={isWidgetHeader}
          cardHovered={cardHovered}
        />

        {!isWidgetHeader && (
          <div
            style={{
              position: 'absolute',
              right: 15,
              top: '25%',
              bottom: '75%',
              float: 'right',
              verticalAlign: 'middle',
              lineHeight: '100%',
            }}
            onClick={(e) => toggleChat(e)}
          >
            <IoChatbubblesOutline className={messageIcon()} />
          </div>
        )}
      </motion.header>
      <CardSeparator cardHovered={cardHovered} expanded={expanded} />
      <AnimatePresence initial={'collapsed'}>
        {expanded && (
          <motion.section
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { height: 'auto', color: colors.offWhite },
              collapsed: { height: 0, color: 'rgba(0,0,0,0)' },
            }}
            transition={{ duration: 0.15, ease: [0.04, 0.62, 0.23, 0.98] }}
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
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
