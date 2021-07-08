import React, { useEffect, useState, useRef } from 'react';
import { css } from '@stitches/react';
import Avatar from 'react-avatar';
import Marquee from 'react-fast-marquee';
import { motion } from 'framer-motion';
import { Flipper, Flipped } from 'react-flip-toolkit';
import ReactPlayer from 'react-player/youtube';

import colors from '../config/colors';
import Marky from './Marky';

const flipper = css({
  backgroundColor: 'white',
  marginTop: -20, // the Flipper component has some inherent top margin
  marginLeft: -25,
  paddingBottom: 1,
});
const playerContainer = css({
  position: 'relative',
  paddingTop: '56.25%' /* Player ratio: 100 / (1280 / 720) */,
});
const player = css({
  position: 'absolute',
  top: 0,
  left: 0,
});

export default function CardBody({ activity, userID, toggleExpansion }) {
  const playerRef = useRef();

  const [URL, setURL] = useState(null);
  const [ytTime, setYtTime] = useState(null);
  const [markyToReplaceWithYouTubeVideo, setMarkyToReplaceWithYouTubeVideo] =
    useState(null);

  useEffect(() => {
    activity.forEach((item) => {
      item.YouTubeURL && setURL(item.YouTubeURL);
      item.YouTubeTime && setYtTime(item.YouTubeTime);
    });
    console.log(URL);
  }, [markyToReplaceWithYouTubeVideo]);

  useEffect(() => {
    playerRef?.current?.seekTo(ytTime, 'seconds');
  }, [playerRef.current]);

  const handleClosePlayer = () => {
    setMarkyToReplaceWithYouTubeVideo(null);
  };

  return (
    <>
      <Flipper className={flipper()}>
        <ul>
          {activity.map((activity, index) =>
            markyToReplaceWithYouTubeVideo != index ? (
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
              <div className={playerContainer()} onClick={handleClosePlayer()}>
                <ReactPlayer
                  ref={playerRef}
                  className={player()}
                  width="80%"
                  controls
                  url={URL}
                />
              </div>
            )
          )}
        </ul>
      </Flipper>
    </>
  );
}
