import React, { useEffect, useState, useRef } from 'react';
import { css } from '@stitches/react';
import Avatar from 'react-avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Flipper, Flipped } from 'react-flip-toolkit';
import ReactPlayer from 'react-player/youtube';

import colors from '../config/colors';
import Marky from './Marky';

const flipper = css({
  backgroundColor: colors.depressedWhite,
  marginTop: -16, // the Flipper component has some inherent top margin
  marginLeft: -25,
  // paddingBottom: 1,
});
const playerContainer = css({
  position: 'relative',
  paddingTop: '56.25%' /* Player ratio: 100 / (1280 / 720) */,
  marginLeft: 0,
  marginRight: 14,
});
const closeText = css({
  textAlign: 'right',
  fontWeight: '700',
  fontSize: '0.9em',
  color: colors.darkmodeDisabledText,
  marginRight: 8,
  paddingBottom: 4,
  marginBottom: 0,
});

export default function CardBody({
  activity,
  userID,
  markyToReplaceWithYouTubeVideo,
  setMarkyToReplaceWithYouTubeVideo,
  expanded,
}) {
  const playerRef = useRef();

  const [URL, setURL] = useState(null);
  const [ytTime, setYtTime] = useState(null);

  useEffect(() => {
    activity?.forEach((item) => {
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
          {activity?.map((activity, index) =>
            markyToReplaceWithYouTubeVideo != index ? (
              <Flipped key={index} flipId={'yo'}>
                <Marky
                  {...activity}
                  userID={userID}
                  setMarkyToReplaceWithYouTubeVideo={
                    setMarkyToReplaceWithYouTubeVideo
                  }
                  markyToReplaceWithYouTubeVideo={
                    markyToReplaceWithYouTubeVideo
                  }
                  marKey={index}
                  expanded={expanded}
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
                          // Using my regular css library crashes the widget
                          // when out of view
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                          }}
                          width="100%"
                          height="90%"
                          controls
                          url={URL}
                        />

                        <div
                          style={{
                            borderBottom: '2px solid black',
                            marginLeft: 12,
                            marginRight: 12,
                            margin: '0 auto',
                            paddingTop: 5,
                          }}
                        >
                          <h1
                            className={closeText()}
                            onClick={() =>
                              setMarkyToReplaceWithYouTubeVideo(null)
                            }
                          >
                            close
                          </h1>
                        </div>
                      </motion.div>
                      <Flipped key={index} flipId={'yo'}>
                        <Marky
                          {...activity}
                          userID={userID}
                          setMarkyToReplaceWithYouTubeVideo={
                            setMarkyToReplaceWithYouTubeVideo
                          }
                          markyToReplaceWithYouTubeVideo={
                            markyToReplaceWithYouTubeVideo
                          }
                          marKey={index}
                          expanded={expanded}
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
