import React, { useState, useEffect } from 'react';
import { css } from '@stitches/react';
import '../App.global.css';
import Marquee from 'react-fast-marquee';
import { BiPlanet } from 'react-icons/bi';

import { useAuth } from '../contexts/AuthContext';

import { db } from '../config/firebase';
import colors from '../config/colors';

const header = css({ flexDirection: 'column' });
const subContainer = css({ flexDirection: 'row', display: 'flex' });

export default function UserStatus() {
  const { currentUser } = useAuth();

  const [activeWindowTitle, setactiveWindowTitle] = useState();
  const [activeTabTitle, setActiveTabTitle] = useState();
  const [activeTabURL, setActiveTabURL] = useState();
  const [playTabMarquee, setPlayTabMarquee] = useState(false);
  const [playWindowMarquee, setPlayWindowMarquee] = useState(false);

  let process;
  let currentListener;

  const handleLinkClick = (url) => {
    const shell = require('electron').shell;
    shell.openExternal(url);
  };

  const activeWindowListener = () => {
    var path = require('path');
    const execFile = require('child_process').execFile;

    var exePath = path.resolve(__dirname, '../scripts/ActiveWindowListener.py');
    process = execFile('python', [exePath]);

    process.stdout.on('data', function (data) {
      let activeWindow = data.toString().trim();

      // Second comparison doesn't work for some reason
      if (activeWindow !== 'Sharehub' && activeWindow !== 'Task Switching') {
        setactiveWindowTitle(activeWindow);

        db.collection('Users')
          .doc(currentUser.uid)
          .collection('Activity')
          .doc('ActiveWindow')
          .set({ WindowTitle: activeWindow, Date: new Date() });
      }
    });

    process.on('error', function (err) {
      if (err) return console.error(err);
    });
  };

  const activeTabListener = () => {
    currentListener = db
      .collection('Users')
      .doc(currentUser.uid)
      .collection('Activity')
      .doc('ChromiumTab')
      .onSnapshot(
        (doc) => {
          setActiveTabTitle(doc.data().TabTitle);
          setActiveTabURL(doc.data().TabURL);
        },
        (error) => {
          console.log('Listener error: ', error);
        }
      );
  };

  const exitListeners = () => {
    process.kill();
    currentListener();
  };

  useEffect(() => {
    activeWindowListener();
    activeTabListener();

    // return exitListeners();
  }, []);

  return (
    <div className={header()}>
      <div className={subContainer()}>
        <BiPlanet />
        {playTabMarquee ? (
          <Marquee
            className="tabLink"
            play={playTabMarquee}
            gradientWidth={25}
            speed={25}
          >
            <div
              onMouseEnter={() => {
                setPlayTabMarquee(true);
              }}
              onMouseLeave={() => {
                setPlayTabMarquee(false);
              }}
            >
              <a onClick={() => handleLinkClick(activeTabURL)}>
                {activeTabTitle}
              </a>
              <span>&nbsp;&nbsp;</span>
            </div>
          </Marquee>
        ) : (
          <div
            className={'activityText'}
            onMouseEnter={() => {
              setPlayTabMarquee(true);
            }}
            onMouseLeave={() => {
              setPlayTabMarquee(false);
            }}
          >
            <a onClick={() => handleLinkClick(activeTabURL)}>
              {activeTabTitle}
            </a>
            <span>&nbsp;&nbsp;</span>
          </div>
        )}
      </div>
      {playWindowMarquee ? (
        <Marquee play={playWindowMarquee} gradientWidth={25} speed={25}>
          <div
            onMouseEnter={() => {
              setPlayWindowMarquee(true);
            }}
            onMouseLeave={() => {
              setPlayWindowMarquee(false);
            }}
          >
            {activeWindowTitle}
            <span>&nbsp;&nbsp;</span>
          </div>
        </Marquee>
      ) : (
        <div
          className={'activityText'}
          onMouseEnter={() => {
            setPlayWindowMarquee(true);
          }}
          onMouseLeave={() => {
            setPlayWindowMarquee(false);
          }}
        >
          {activeWindowTitle}
          <span>&nbsp;&nbsp;</span>
        </div>
      )}
    </div>
  );
}
