import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import colors from '../config/colors';
import animations from '../config/animations';
import { BackgroundNoise } from './FriendsList';

const { remote } = require('electron');

const MiniWidget = ({ widgetVisible }) => (
  <motion.div
    initial={'hide'}
    animate={widgetVisible ? 'show' : 'hide'}
    variants={{
      show: {
        opacity: 1,
        x: 0,
        transition: {
          delay: 0.15,
          duration: 0.5,
          type: 'spring',
          bounce: 0,
        },
      },
      hide: {
        opacity: 0,
        x: 100,
        transition: {
          delay: 0.25,
          duration: 0.5,
          type: 'spring',
          bounce: 0,
        },
      },
    }}
    style={{
      position: 'absolute',
      bottom: 0,
      right: 0,

      width: 80,
      height: '100%',
      outline: '3px solid ' + colors.darkmodeMediumWhite,
      backgroundColor: colors.offWhitePressed2,
      zIndex: 1,
    }}
  >
    {[0, 1, 2, 3].map((item, index) => (
      <div
        style={{
          opacity: 0.3,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',

          marginBottom: index === 0 ? 10 : 8,
          marginTop: 10,
          marginBottom: index === 0 ? 10 : 6,
          marginLeft: index === 0 ? 10 : 12,
          marginRight: 10,
          gap: 6,
        }}
      >
        <div
          style={{
            flexShrink: 0,
            borderRadius: '100%',
            backgroundColor: colors.defaultPlaceholderTextColor,
            width: index === 0 ? 11 : 10,
            height: index === 0 ? 11 : 10,

            //   padding: 1,
            textAlign: 'center',
          }}
        >
          {' '}
        </div>
        <div
          style={{
            width: '100%',
            backgroundColor: colors.defaultPlaceholderTextColor,
            height: 6,
            borderRadius: 15,
          }}
        ></div>
      </div>
    ))}
  </motion.div>
);

const KeyboardKey = ({ animationController, text }) => (
  <motion.div
    initial={{ opacity: 0.9, scale: 0.9 }}
    animate={animationController}
    exit={{ opacity: 0.9, scale: 0.9 }}
    style={{
      marginInline: 10,
      padding: 2,
      backgroundColor: colors.offWhitePressed2,
      zIndex: 100,
      boxShadow: '0px 11px 20px -10px rgba(0, 0, 0, 0.46)',
      borderTop: '1px solid var(--off-white-pressed2)',
      borderBottom: '3px solid var(--off-white-pressed2)',
      borderLeft: '2px solid var(--off-white-pressed2)',
      borderRight: '2px solid var(--off-white-pressed2)',
      borderRadius: 4,
      overflow: 'hidden',
      paddingTop: 0,
      paddingBottom: 2,
      paddingLeft: 2,
      paddingRight: 1,
    }}
  >
    <div
      style={{
        boxShadow:
          'inset -28px -34px 17px -25px rgba(230, 204, 178, 0.5) inset 3px 0px 3px 0px rgba(0, 0, 0, 0.151), inset 0px 2px 1px 0px rgb(255, 255, 255), inset 0px -7px 1px 0px rgba(0, 0, 0, 0.137), inset -3px 0px 3px 0px rgba(39, 39, 39, 0.144)',
        fontSize: '0.9em',
        color: colors.darkmodeLighterBlack,

        alignItems: 'center',
        background: 'rgba(253, 245, 241, 1)',
        // borderBottom: '1px solid #00000086',
        borderRadius: 4,
        boxSizing: 'border-box',
        display: 'flex',
        height: 34,
        justifyContent: 'center',
        padding: 5,
        width: 48,
        fontWeight: '700',
      }}
    >
      {text}
    </div>
  </motion.div>
);

export default function WelcomeModalContent() {
  const [widgetVisible, setWidgetVisible] = useState(false);

  const keyAnimationController = useAnimation();

  const animateKeys = async () => {
    // Keydown
    await keyAnimationController.start({
      opacity: 0.86,
      scale: 0.94,
      transition: { duration: 0.1 },
    });
    // Keyup
    keyAnimationController.start({
      opacity: 1,
      scale: 1,
      transition: { duration: 0.15, delay: 0.15 },
    });
  };

  useEffect(() => {
    const timeout = setTimeout(() => setWidgetVisible(!widgetVisible), 1450);

    animateKeys();

    return () => clearTimeout(timeout);
  }, [widgetVisible]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5 }}
      className="draggable"
      style={{
        backgroundColor: colors.offWhite,
        borderRadius: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginInline: 20,
          marginTop: 15,
          fontSize: '0.8em',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <KeyboardKey
              animationController={keyAnimationController}
              text="ctrl"
            />
            {/* <div style={{ opacity: 0.6 }}>
              or</div>
            <KeyboardKey
              animationController={keyAnimationController}
              text="cmd"
            /> */}
          </div>
          <div style={{ opacity: 0.6 }}>+</div>
          <KeyboardKey animationController={keyAnimationController} text="q" />
        </div>
        <MiniWidget widgetVisible={widgetVisible} />
      </div>
      <motion.div
        className="undraggable"
        whileHover={{
          color: colors.darkmodeBlack,
          transition: { duration: 0.1 },
          borderBottomColor: colors.darkmodeBlack,
        }}
        style={{
          cursor: 'pointer',
          zIndex: 10,
          marginLeft: 'auto',
          marginBottom: 8,
          paddingRight: 16,
          marginRight: 12,
          marginTop: -20,
          paddingLeft: 6,
          paddingBottom: 6,
          width: 62,
          fontSize: '0.8em',

          color: colors.darkmodeLightBlack,
          borderBottom: '1px solid ' + colors.offWhitePressed2,

          zIndex: 20,
        }}
        whileTap={animations.whileTap}
        onClick={() => remote.getCurrentWindow().hide()}
      >
        got it
      </motion.div>
      <BackgroundNoise />
    </motion.div>
  );
}
