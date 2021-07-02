import React, { useState, useEffect } from 'react';
import { css } from '@stitches/react';
import { Accordion, AccordionItem } from 'react-sanfona';
import { Flipper, Flipped } from 'react-flip-toolkit';
import '../App.global.css';

import { useAuth } from '../contexts/AuthContext';
import FriendCardHeader from './FriendCardHeader';
import colors from '../config/colors';
import { db, field } from '../config/firebase';
import Marky from './Marky';

const container = css({});
const accordionItemTitle = css({ height: 60, paddingTop: 20 });
const accordionItem = css({
  borderBottom: '3px solid transparent',
  transition: 'borderBottom .25s ease',
  '&:hover': {
    borderBottomColor: colors.darkOpacity,
  },
});
const accordionItemBody = css({
  paddingTop: 20,
  backgroundColor: 'white',
  height: 100,
});
const flipper = css({
  height: '100%',
});
const findButton = css({
  backgroundColor: 'white',
  padding: 10,
});

export default function FriendsList() {
  const { currentUser } = useAuth();

  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [searchValue, setSearchValue] = useState();
  const [findFriendsVisible, setFindFriendsVisible] = useState(false);

  // Use the functions passed in this array to unsubscribe
  // from firestore documents in the cases of friend status
  // changes (no longer friends, offline, etc)
  const [snapshotUnsubscribers, setSnapshotUnsubscribers] = useState([]);

  const handleSearchInput = (evt) => {
    setSearchValue(evt.target.value);

    setFilteredFriends(
      evt.target.value
        ? friends.filter((friend) =>
            friend.Name.toLowerCase().includes(evt.target.value.toLowerCase())
          )
        : friends
    );
  };

  const handleFindButtonClick = () => {
    findFriends();
  };

  const findFriends = () => {
    toggleFindFriends();
  };

  const toggleFindFriends = () => {
    setFindFriendsVisible(!findFriendsVisible);
  };

  const setActivityListeners = (friend) => {
    const windowListener = friend.ActiveWindowRef.onSnapshot(
      (querySnapshot) => {
        friend.ActivityRef.orderBy('Date', 'desc')
          .get()
          .then((snapshot) => {
            let friendsCopy = friends;

            friendsCopy[friend.key].Activity.length = 0;

            snapshot.forEach((doc) => {
              friendsCopy[friend.key].Activity.push(doc.data());

              setFriends(friendsCopy);
            });
          });
      }
    );
    const tabListener = friend.ActiveTabRef.onSnapshot((querySnapshot) => {
      friend.ActivityRef.orderBy('Date', 'desc')
        .get()
        .then((snapshot) => {
          let friendsCopy = friends;

          friendsCopy[friend.key].Activity.length = 0;

          snapshot.forEach((doc) => {
            friendsCopy[friend.key].Activity.push(doc.data());

            setFriends(friendsCopy);
          });
        });
    });

    setSnapshotUnsubscribers((oldArray) => [
      ...oldArray,
      {
        UserID: friend.UserID,
        Listeners: [windowListener, tabListener],
      },
    ]);
  };

  useEffect(() => {
    // Maybe getting friends should be done in authcontext
    // Get current user
    db.collection('Users')
      .doc(currentUser.uid)
      .get()
      .then((doc) => {
        let dbFriends = [];
        let index = 0; // For keys used in render

        const friendsRef = db
          .collection('Users')
          // Filter document IDs in Users by current users friends
          .where(field.FieldPath.documentId(), 'in', doc.data().Friends)
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              let activityRef = doc.ref.collection('Activity');

              dbFriends.push({
                key: index,
                UserID: doc.id,
                Name: doc.data().Name,
                ActivityRef: activityRef,
                ActiveWindowRef: activityRef.doc('ActiveWindow'),
                ActiveTabRef: activityRef.doc('ChromiumTab'),
                Activity: [],
              });

              index++;
            });

            setFriends(dbFriends);
            setFilteredFriends(dbFriends);
          });
      });
  }, []);

  let ranOnce = false;
  useEffect(() => {
    if (!ranOnce) {
      friends.forEach((friend) => {
        setActivityListeners(friend);
      });
      ranOnce = true;
    }
  }, [friends]);

  return (
    <div className={container()}>
      {/* <input
        type="text"
        value={searchValue || ''}
        onChange={handleSearchInput}
      /> */}
      {friends.length ? (
        <Accordion allowMultiple={true}>
          {!findFriendsVisible &&
            filteredFriends.map((friend) => (
              <AccordionItem
                easing="ease-out"
                title={
                  <div className={accordionItemTitle()}>
                    <FriendCardHeader
                      key={friend.key}
                      name={friend.Name}
                      mainActivity={friend.Activity[0]}
                    />
                  </div>
                }
                className={accordionItem()}
                bodyClassName={accordionItemBody()}
              >
                <Flipper
                  className={flipper()}
                  flipKey={
                    (friend.Activity?.WindowData?.key,
                    friend.Activity?.TabData?.key)
                  }
                >
                  <ul>
                    {friend.Activity.map((activity) => (
                      <Flipped key={activity.key} flipId={'yo'}>
                        {/* <div className="activityText">
                          {activity.WindowTitle || activity.TabTitle}
                        </div> */}
                        <Marky {...activity} />
                      </Flipped>
                    ))}
                  </ul>
                </Flipper>
              </AccordionItem>
            ))}
        </Accordion>
      ) : (
        <div>
          <h1>you have no friends Sadge</h1>
        </div>
      )}

      {searchValue && (
        <div onClick={handleFindButtonClick} className={findButton()}>
          Find '{searchValue}'
        </div>
      )}
    </div>
  );
}
