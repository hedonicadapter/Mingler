import React from 'react';
import colors from '../config/colors';
import { motion } from 'framer-motion';
import { WindowFrame } from './reusables/WindowFrame';
import { BackgroundNoise } from './FriendsList';
import { IoIosArrowBack } from 'react-icons/io';
import animations from '../config/animations';

const { ipcRenderer } = require('electron');

export default function SpotifyContent() {
  return (
    <WindowFrame title="Connect to Spotify">
      <div
        style={{
          height: 890,
          backgroundColor: colors.offWhite,
          '&:after': { content: '' },
        }}
      ></div>
      <footer
        style={{
          bottom: 0,
          position: 'fixed',
          minHeight: 30,
          width: '100%',

          backgroundColor: colors.offWhite,
        }}
      >
        <motion.div
          whileHover={animations.whileHover}
          whileTap={animations.whileTap}
          style={{ cursor: 'pointer', zIndex: 100 }}
          onClick={() => {
            ipcRenderer.send('spotifygoback:fromrenderer');
          }}
        >
          <IoIosArrowBack size={22} color={colors.darkmodeLightBlack} />
        </motion.div>
      </footer>
      <BackgroundNoise />
    </WindowFrame>
  );
}
