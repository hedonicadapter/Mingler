import React, { useEffect, useState } from 'react';
import { GoPrimitiveDot } from 'react-icons/go';

import styles from './MenuButton.module.css';
import { useAuth } from '../contexts/AuthContext';
import colors from '../config/colors';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from '../mainState/features/settingsSlice';
import { appVisibleTrue } from '../mainState/features/appSlice';
const ipcRenderer = require('electron').ipcRenderer;

export default function MenuButton() {
  const { signOut, signedIn } = useAuth();
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => getCurrentUser(state));
  const [menuVisibility, setMenuVisibility] = useState(false);

  useEffect(() => {
    ipcRenderer.on('tray:signout', handleSignoutButton);

    return () =>
      ipcRenderer.removeAllListeners('tray:signout', handleSignoutButton);
  }, []);

  const toggleMenu = () => {
    setMenuVisibility(!menuVisibility);
  };

  const handleSignoutButton = async () => {
    dispatch(appVisibleTrue());
    const dialogueResponse = await ipcRenderer.invoke(
      'showdialog:fromrenderer',
      currentUser.guest // true or false
    );
    if (dialogueResponse) signOut();
  };

  const handleExitButton = () => {
    ipcRenderer.send('exit:frommenubutton');
    window.close();
  };

  return (
    <>
      <AnimatePresence>
        {menuVisibility && (
          <motion.div
            className={styles.container}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ staggerChildren: 0.25, duration: 0.15 }}
            whileHover={{ backgroundColor: colors.darkmodeBlack }}
            onMouseEnter={() => setMenuVisibility(true)}
            onMouseLeave={() => setMenuVisibility(false)}
          >
            <motion.ol
              className={styles.list}
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              initial="hidden"
              animate="show"
            >
              {/* future feature: link to troubleshooting guide, download links, and other stuff */}
              {/* <motion.li
                whileHover={{ color: 'rgba(255,255,255,0.7)' }}
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
              >
                Help
              </motion.li> */}
              {/* future feature: minimize to tray */}
              {/* <motion.li
                whileHover={{ color: 'rgba(255,255,255,0.7)' }}
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
              >
                Close
              </motion.li> */}
              {/* <hr /> */}
              {currentUser && signedIn && (
                <motion.li
                  className={styles.listItem}
                  whileHover={{ color: colors.offWhitePressed2 }}
                  transition={{ duration: 0.15 }}
                  variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
                  onClick={handleSignoutButton}
                >
                  sign out
                </motion.li>
              )}
              <motion.li
                className={styles.listItem}
                whileHover={{ color: colors.offWhitePressed2 }}
                transition={{ duration: 0.15 }}
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
                onClick={handleExitButton}
              >
                exit
              </motion.li>
            </motion.ol>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className={styles.menuButtonStyle}
        animate={menuVisibility ? 'visible' : 'hidden'}
        variants={{
          visible: { backgroundColor: colors.offWhite },
          hidden: { backgroundColor: colors.darkmodeLightBlack },
        }}
        onMouseEnter={() => setMenuVisibility(true)}
        onMouseLeave={() => setMenuVisibility(false)}
      ></motion.div>
    </>
    // <motion.div
    //   key={0}
    //   initial={{ borderRadius: '50%' }}
    //   animate={{ position: 'fixed' }}
    //   whileHover={{
    //     borderRadius: '10%',
    //     // scaleX: 1.5,
    //     // scaleY: 1.5,
    //     scaleY: 6,
    //     width: 100,
    //     // y: 0,
    //   }}
    //   className={styles.menuButtonStyle}
    // >
    //   <div style={{ fontSize: '0.2em' }}>yooo</div>
    // </motion.div>
  );
}
