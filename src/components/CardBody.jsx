import React, { useEffect, useState, useRef } from 'react';
import { css } from '@stitches/react';
import Avatar from 'react-avatar';
import Marquee from 'react-fast-marquee';
import { motion, AnimatePresence } from 'framer-motion';
import { Flipper, Flipped } from 'react-flip-toolkit';
import ReactPlayer from 'react-player/youtube';

import colors from '../config/colors';
import Marky from './Marky';

const flipper = css({
  backgroundColor: colors.depressedWhite,
  marginTop: -20, // the Flipper component has some inherent top margin
  marginLeft: -25,
  paddingBottom: 1,
});
const playerContainer = css({
  position: 'relative',
  paddingTop: '56.25%' /* Player ratio: 100 / (1280 / 720) */,
  marginLeft: 0,
  marginRight: 14,
});

export default function CardBody({ activity, userID, toggleExpansion }) {
  const playerRef = useRef();

  const [URL, setURL] = useState(null);
  const [ytTime, setYtTime] = useState(null);
  const [markyToReplaceWithYouTubeVideo, setMarkyToReplaceWithYouTubeVideo] =
    useState(null);
  const [youTubeVideoVisible, setYouTubeVideoVisible] = useState(false);

  useEffect(() => {
    activity.forEach((item) => {
      item.YouTubeURL && setURL(item.YouTubeURL);
      item.YouTubeTime && setYtTime(item.YouTubeTime);
    });
    console.log(markyToReplaceWithYouTubeVideo);
  }, [markyToReplaceWithYouTubeVideo]);

  useEffect(() => {
    playerRef?.current?.seekTo(ytTime, 'seconds');
  }, [playerRef.current]);

  const handleClosePlayer = () => {
    // setMarkyToReplaceWithYouTubeVideo(null);
  };

  return (
    <>
      <Flipper className={flipper()}>
        <ul>
          {activity.map((activity, index) =>
            markyToReplaceWithYouTubeVideo != index && index != 0 ? (
              <Flipped key={index} flipId={'yo'}>
                <Marky
                  {...activity}
                  userID={userID}
                  toggleExpansion={toggleExpansion}
                  setMarkyToReplaceWithYouTubeVideo={
                    setMarkyToReplaceWithYouTubeVideo
                  }
                  markyToReplaceWithYouTubeVideo={
                    markyToReplaceWithYouTubeVideo
                  }
                  marKey={index}
                />
              </Flipped>
            ) : (
              index != 0 && (
                <AnimatePresence initial={false}>
                  {markyToReplaceWithYouTubeVideo && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{
                          duration: 0.15,
                          ease: [0.04, 0.62, 0.23, 0.98],
                        }}
                        className={playerContainer()}
                      >
                        <ReactPlayer
                          // onReady={() =>
                          //   setYouTubeVideoVisible(!youTubeVideoVisible)
                          // }
                          onClick={handleClosePlayer()}
                          ref={playerRef}
                          // Using my regular css component crashes the widget
                          // when out of view
                          style={{ position: 'absolute', top: 0, left: 0 }}
                          width="100%"
                          height="90%"
                          controls
                          url={URL}
                        />
                      </motion.div>
                      <Flipped key={index} flipId={'yo'}>
                        <Marky
                          {...activity}
                          userID={userID}
                          toggleExpansion={toggleExpansion}
                          setMarkyToReplaceWithYouTubeVideo={
                            setMarkyToReplaceWithYouTubeVideo
                          }
                          markyToReplaceWithYouTubeVideo={
                            markyToReplaceWithYouTubeVideo
                          }
                          marKey={index}
                        />
                      </Flipped>
                    </>
                  )}
                </AnimatePresence>
              )
            )
          )}
        </ul>
      </Flipper>
    </>
  );
}
