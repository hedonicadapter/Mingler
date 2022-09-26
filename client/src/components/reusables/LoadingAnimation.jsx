import React from 'react';
import ReactLoading from 'react-loading';
import { AnimatePresence, motion } from 'framer-motion';

import colors from '../../config/colors';

const AnimationWrapper = ({ children, index, style }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={style}
      key={index}
    >
      {children}
    </motion.div>
  );
};

export const LoadingAnimation = ({
  formFilled,
  buttonText = '',
  error,
  style,
}) => {
  return (
    <div
      style={
        style
          ? {
              ...style,
              position: 'absolute',
              right: 0,
            }
          : {
              width: '100%',
              position: 'absolute',
              right: 0,
              ...style,
            }
      }
    >
      <AnimatePresence exitBeforeEnter>
        {formFilled === 'loading' && !error && (
          <AnimationWrapper index={formFilled}>
            <ReactLoading
              style={{
                outline: '1px solid transparent', // makes it work for some reason
                width: '1.1em',
                height: '1.1em',
                // float: 'right',

                paddingRight: style ? 0 : 12,
              }}
              type={'spin'}
              color={colors.defaultPlaceholderTextColor}
            />
          </AnimationWrapper>
        )}

        {!error && formFilled !== 'loading' && (
          <AnimationWrapper index={formFilled}>{buttonText}</AnimationWrapper>
        )}

        {error && (
          <AnimationWrapper
            index={error}
            style={{ fontSize: '0.9em', color: colors.coffeeRed }}
          >
            {error}
          </AnimationWrapper>
        )}
      </AnimatePresence>
    </div>
  );
};
