import React from 'react';
import ReactLoading from 'react-loading';
import { AnimatePresence, motion } from 'framer-motion';

import colors from '../../config/colors';

export const LoadingAnimation = ({ formFilled, buttonText = '', style }) => {
  return (
    <>
      <AnimatePresence>
        {formFilled === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ marginLeft: 40, ...style }}
          >
            <ReactLoading
              style={{ outline: '1px solid transparent' }} // makes it work for some reason
              type={'spin'}
              color={colors.darkmodeLightBlack}
              height={'0.8em'}
              width={'0.8em'}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {formFilled !== 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {buttonText}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
