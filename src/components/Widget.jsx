import React, { useState } from 'react';
import { css, styled } from '@stitches/react';
import {
  TransitionGroup,
  CSSTransition,
  Transition,
} from 'react-transition-group';
import * as electron from 'electron';

import './Widget.css';

import colors from '../config/colors';
import WidgetHeader from './WidgetHeader';
import FriendsList from './FriendsList';
import SettingsPane from './SettingsPane';
import { auth, db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import WidgetFooter from './WidgetFooter';

const ipc = electron.ipcRenderer;
ipc.setMaxListeners(2);

const MainPane = styled('div', {
  marginTop: -10,
  float: 'right',
  overflow: 'hidden',
  transition: 'transform 300ms ease, opacity 150ms ease-in',
  width: window.innerWidth * 0.92,
  willChange: 'transform',

  variants: {
    visible: {
      true: {
        pointerEvents: 'auto',
        transform: 'translateX(0%)',
        opacity: 1,
      },
      false: {
        pointerEvents: 'none',
        transform: 'translateX(120%)',
        opacity: 0,
      },
    },
  },
});

export default function Widget() {
  //clickthrough everything except className='clickable' (pointer-events: 'auto')
  const setIgnoreMouseEvents =
    require('electron').remote.getCurrentWindow().setIgnoreMouseEvents;
  addEventListener('pointerover', function mousePolicy(event) {
    mousePolicy._canClick =
      event.target === document.documentElement
        ? mousePolicy._canClick && setIgnoreMouseEvents(true, { forward: true })
        : mousePolicy._canClick || setIgnoreMouseEvents(false) || 1;
  });
  setIgnoreMouseEvents(true, { forward: true });

  const [visible, setVisible] = useState(true);
  const toggleMainPane = () => {
    setVisible(!visible);
  };
  ipc.once('globalshortcut', (evt, args) => {
    toggleMainPane();
  });
  ipc.once('hideWidget', (evt, args) => {
    setVisible(false);
  });

  return (
    <MainPane visible={visible}>
      {/* <Transition timeout={275} in={visible} appear>
        {(state) => (
          <div style={{ ...defaultStyle, ...transitionStyles[state] }}>
            <AutoResponsive {...getAutoResponsiveProps()}>
              {paneList.map((i) => {
                return (
                  <div key={i} className="item" style={styleList[i]}>
                    {i}
                    {i == 1 && (
                      <div>
                        <WidgetHeader />
                        <FriendsList />
                        <WidgetFooter toggleSettingsPane={toggleSettingsPane} />
                      </div>
                    )}
                  </div>
                );
              })}
            </AutoResponsive>
          </div>
        )}
      </Transition> */}
      <WidgetHeader />
      <FriendsList />
      <WidgetFooter />
    </MainPane>
  );
}
