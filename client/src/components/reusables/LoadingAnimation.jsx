import React from 'react';
import ReactLoading from 'react-loading';
import { AnimatePresence, motion } from 'framer-motion';

import colors from '../../config/colors';

export const LoadingAnimation = ({
  formFilled,
  buttonText = '',
  error,
  style,
}) => {
  return (
    <AnimatePresence>
      <div
        style={
          style
            ? {
                ...style,
              }
            : {
                marginLeft: 40,
                width: 100,
                height: 30,
                ...style,
              }
        }
      >
        {formFilled === 'loading' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            key={formFilled}
          >
            <ReactLoading
              style={{
                outline: '1px solid transparent', // makes it work for some reason
                width: '1.1em',
                height: '1.1em',
                float: 'right',
                paddingRight: style ? 0 : 12,
              }}
              type={'spin'}
              color={colors.defaultPlaceholderTextColor}
            />
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            key={formFilled}
            style={{ fontSize: '0.9em', color: colors.coffeeRed }}
          >
            {error}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            key={formFilled}
          >
            {buttonText}
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};
