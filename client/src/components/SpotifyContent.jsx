import React, { useEffect, useState } from 'react';
import colors from '../config/colors';
import { motion } from 'framer-motion';
import { WindowFrame } from './reusables/WindowFrame';
import { BackgroundNoise } from './FriendsList';
import { IoIosArrowBack } from 'react-icons/io';
import animations from '../config/animations';
import { LoadingAnimation } from './reusables/LoadingAnimation';

const { ipcRenderer, remote } = require('electron');

export default function SpotifyContent() {
  const [loading, setLoading] = useState('');

  const loadingStartHandler = () => {
    setLoading('loading');
  };
  const loadingStopHandler = () => {
    setLoading('');
  };

  useEffect(() => {
    const view = remote?.getCurrentWindow()?.getBrowserView()?.webContents;

    if (!view) return;

    view.on('did-start-loading', loadingStartHandler);
    view.on('did-stop-loading', loadingStopHandler);

    ipcRenderer.once('exit:frommain', () => {
      window.onbeforeunload = (e) => {
        e.returnValue = undefined;
      };
    });
    return () => {
      if (!view) return;
      view.removeListener('did-start-loading', loadingStartHandler);
      view.removeListener('did-stop-loading', loadingStopHandler);
    };
  }, []);

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
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginInline: 6,

          backgroundColor: colors.offWhite,
        }}
      >
        <motion.div
          whileHover={animations.whileHover}
          whileTap={animations.whileTap}
          style={{ cursor: 'pointer', zIndex: 100, width: 30 }}
          onClick={() => {
            ipcRenderer.send('spotifygoback:fromrenderer');
          }}
        >
          <IoIosArrowBack size={22} color={colors.darkmodeLightBlack} />
        </motion.div>
        <div
          style={{
            zIndex: 100,
            outline: '1px solid red',
            paddingTop: 2,
          }}
        >
          <LoadingAnimation
            formFilled={loading}
            style={{ position: 'relative', marginRight: 14 }}
          />
        </div>
      </footer>
      <BackgroundNoise />
    </WindowFrame>
  );
}
