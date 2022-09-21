import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import styles from '../SettingsContent.module.css';

import hotkeys from 'hotkeys-js';
import Keyboard from 'react-simple-keyboard';

import colors from '../../config/colors';
import keys from '../../config/keys';
// import layout from 'simple-keyboard-layouts/build/layouts/swedish';

const { remote, clipboard, ipcRenderer } = require('electron');
const BrowserWindow = remote.BrowserWindow;

const defaultLayout = [
  '{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}',
  '1 2 3 4 5 6 7 8 9 0 + {backspace}',
  '{tab} q w e r t y u i o p \u00E5 ¨',
  "{capslock} a s d f g h j k l \u00F6 \u00E4 ' {enter}",
  '{shiftleft} z x c v b n m , . - {shiftright}',
  '{controlleft} {altleft} {space} {altright} {controlright}',
];

const shiftLayout = [
  '{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}',
  '! " # $ % & / ( ) = ? {backspace}',
  '{tab} Q W E R T Y U I O P \u00C5 ^',
  '{capslock} A S D F G H J K L \u00D6 \u00C4 * {enter}',
  '{shiftleft} Z X C V B N M ; : _ {shiftright}',
  '{controlleft} {altleft} {space} {altright} {controlright}',
];

const MiniWidget = () => (
  <div
    style={{
      width: 55,
      border: '4px solid ' + colors.offWhitePressed2,
      borderRadius: 2,
    }}
  >
    <div
      style={{
        borderBottom: '2px solid ' + colors.defaultPlaceholderTextColor,
        float: 'right',
        width: '100%',
      }}
    >
      <motion.div
        initial={'hide'}
        animate={'show'}
        exit={'hide'}
        transition={{
          duration: 0.15,
          repeat: Infinity,
          repeatType: 'reverse',
          repeatDelay: 1.8,
        }}
        variants={{
          show: {
            transform: 'translateX(0%)',
            opacity: 1,
          },
          hide: {
            transform: 'translateX(100%)',
            opacity: 0,
          },
        }}
        style={{
          float: 'right',
          backgroundColor: colors.offWhite,
          height: 25,
          width: 12,
        }}
        className={styles.miniWidget}
      />
    </div>
  </div>
);

export default function WidgetSettingsContent({
  widgetSettingsContentInView,
  shortcut,
}) {
  const [shortcutFormHovered, setShortcutFormHovered] = useState(false);
  const [shortcutError, setShortcutError] = useState(null);
  const [showShortcutError, setShowShortcutError] = useState(false);
  const [inputRangeValue, setInputRangeValue] = useState(15);
  const [layoutName, setLayoutName] = useState('default');

  const keyboardRef = useRef(null);

  const captureAndSendShorcut = (event) => {
    let pressedKeyCodes = hotkeys.getPressedKeyCodes();
    let shortcuts = [];

    pressedKeyCodes.forEach((val) => {
      let key = keys[val];
      console.log('pressed key: ', key);

      shortcuts.push(key);
    });

    if (shortcuts.length === 1) return;

    ipcRenderer
      .invoke('changeshortcut:fromrenderer', shortcuts.join('+'))
      .then((res) => {
        if (!res) {
          setShortcutError('Something went wrong. Try again.');
        } else setShortcutError(null);
      });
  };

  const clearHighlights = () => {
    keyboardRef.current.recurseButtons((buttonElement) => {
      buttonElement.classList.remove('active');
    });
  };

  const highlightPersistedShortcut = () => {
    let split = shortcut.split('+');
    let keycode = [];

    clearHighlights();

    defaultLayout.forEach((row) => {
      split.forEach((key) => {
        if (key === 'CommandOrControl') key = 'controlleft';
        else if (key === 'Shift') key = 'shiftleft';

        if (key.length <= 1) {
          keycode = key;
        } else {
          keycode = row.match(
            // Match any part of the string and return the whole word with {} if any
            new RegExp(`({?\\b)(\\w*${key}\\w*)(\\b}?)`, 'ig')
          );
        }

        if (!keycode) return;

        keyboardRef.current
          .getButtonElement(keycode[0].toLowerCase())
          ?.classList.add('active');
        keyboardRef.current
          .getButtonElement(keycode[0].toUpperCase())
          ?.classList.add('active');
      });
    });
  };

  const handleShift = () => {
    const newLayoutName = layoutName === 'default' ? 'shift' : 'default';
    setLayoutName(newLayoutName);
  };

  const onKeyPress = (button) => {
    if (
      button === '{shiftleft}' ||
      button === '{shiftright}' ||
      button === '{capslock}'
    )
      handleShift();
  };

  const onInputRangeChange = (evt) => {
    setInputRangeValue(evt.target.value);
  };

  useEffect(() => {
    if (!widgetSettingsContentInView) return;

    hotkeys('*', function (event) {
      captureAndSendShorcut(event);
    });

    return () => hotkeys.unbind('*');
  }, [widgetSettingsContentInView]);

  useEffect(() => {
    if (!keyboardRef.current) return;

    highlightPersistedShortcut();
  }, [keyboardRef, layoutName, shortcut]);

  useEffect(() => {
    if (!shortcutError) return;
    const errorTimeout = setTimeout(() => {
      setShortcutError(null);
      setShowShortcutError(false);
    }, 3000);

    return () => clearTimeout(errorTimeout);
  }, [shortcutError]);

  return (
    <div
      className={styles.settingsContentContainer}
      style={{
        fontSize: '0.9em',
        color: colors.defaultPlaceholderTextColor,
      }}
    >
      <div
        className={styles.keyboardSettingsForm}
        onMouseEnter={() => setShortcutFormHovered(true)}
        onMouseLeave={() => setShortcutFormHovered(false)}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingBottom: 14,
          }}
        >
          <header>Toggle shortcut</header>
          <MiniWidget />
        </div>
        <div className={styles.keyboardContainer}>
          <Keyboard
            onKeyPress={onKeyPress}
            keyboardRef={(r) => (keyboardRef.current = r)}
            physicalKeyboardHighlightBgColor={colors.coffeeOrange}
            layoutName={layoutName}
            layout={{
              default: defaultLayout,
              shift: shiftLayout,
            }}
            display={{
              '{controlleft}': 'Ctrl',
              '{altleft}': 'Alt',
              '{altright}': 'AltGr',
              '{controlright}': 'Ctrl',
              '{enter}': '↩',
              '{backspace}': '⌫',
              '{escape}': 'esc',
              '{f1}': 'F1',
              '{f2}': 'F2',
              '{f3}': 'F3',
              '{f4}': 'F4',
              '{f5}': 'F5',
              '{f6}': 'F6',
              '{f7}': 'F7',
              '{f8}': 'F8',
              '{f9}': 'F9',
              '{f10}': 'F10',
              '{f11}': 'F11',
              '{f12}': 'F12',
              '{tab}': '↹',
              '{capslock}': 'caps',
              '{shiftleft}': '⇧',
              '{shiftright}': '⇧',
              '{space}': ' ',
            }}
            physicalKeyboardHighlight={true}
            physicalKeyboardHighlightPress={true}
          />
        </div>

        <motion.div
          initial={'hide'}
          animate={showShortcutError || shortcutFormHovered ? 'show' : 'hide'}
          variants={{
            show: { height: 'auto', y: 0, opacity: 1 },
            hide: { height: 0, y: -40, opacity: 0 },
          }}
          transition={{ duration: 0.15 }}
        >
          <footer>
            <AnimatePresence>
              {!shortcutError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <p>
                    Press two or more keys on your keyboard to set a new
                    <br />
                    shortcut.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {shortcutError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className={styles.shortcutError}
                  onAnimationComplete={() =>
                    !showShortcutError && setShowShortcutError(true)
                  }
                >
                  <p>{shortcutError}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </footer>
        </motion.div>
      </div>
    </div>
  );
}
