import React, { useState, useEffect } from 'react';
import { css } from '@stitches/react';

import '../App.global.css';
import { motion } from 'framer-motion';

import AccordionItem from './AccordionItem';
import { useAuth } from '../contexts/AuthContext';
import colors from '../config/colors';
import { db, field } from '../config/firebase';
import { getObjectByProp } from '../helpers/arrayTools';
import DAO from '../config/dao';

const container = css({});

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
    const activityListener = friend.ActivityRef.orderBy(
      'Date',
      'desc'
    ).onSnapshot((querySnapshot) => {
      let friendsCopy = friends;

      friendsCopy[friend.key].Activity.length = 0;

      querySnapshot.forEach((doc) => {
        console.log(doc);
        friendsCopy[friend.key].Activity.push(doc.data());

        setFriends(friendsCopy);
      });
    });

    setSnapshotUnsubscribers((oldArray) => [
      ...oldArray,
      {
        UserID: friend.UserID,
        Listeners: [activityListener],
      },
    ]);
  };

  useEffect(() => {
    DAO.getFriends()
      .then((res) => {
        console.log(res.data);
      })
      .catch((e) => {
        console.log(e);
      });
    // Maybe getting friends should be done in authcontext
    // Get current user
    // db.collection('Users')
    //   .doc(currentUser.uid)
    //   .get()
    //   .then((doc) => {
    //     let dbFriends = [];
    //     let index = 0; // For keys used in render

    //     const friendsRef = db
    //       .collection('Users')
    //       // Filter document IDs in Users by current users friends
    //       .where(field.FieldPath.documentId(), 'in', doc.data().Friends)
    //       .get()
    //       .then((querySnapshot) => {
    //         querySnapshot.forEach((doc) => {
    //           let activityRef = doc.ref.collection('Activity');

    //           dbFriends.push({
    //             key: index,
    //             UserID: doc.id,
    //             Name: doc.data().Name,
    //             ActivityRef: activityRef,
    //             Activity: [],
    //           });

    //           index++;
    //         });

    //         setFriends(dbFriends);
    //         setFilteredFriends(dbFriends);
    //       });
    //   });
  }, []);

  let ranOnce = false;
  useEffect(() => {
    if (!ranOnce) {
      db.collection('Users')
        .doc(currentUser.uid)
        .collection('OnlineFriends')
        .onSnapshot((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            let friendsCopy = friends;
            let object = getObjectByProp(friendsCopy, 'UserID', doc.id);
            object && (object.status = 'Online');
            setFriends(friendsCopy);
          });
          friends.forEach((friend) => {
            friend.status === 'Online' && setActivityListeners(friend);
          });
        });

      ranOnce = true;
    }
  }, [friends]);

  return (
    <div className={container()}>
      {friends.length ? (
        !findFriendsVisible &&
        filteredFriends.map((friend) => <AccordionItem friend={friend} />)
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
      {/* <input
        type="text"
        value={searchValue || ''}
        onChange={handleSearchInput}
      /> */}
    </div>
  );
}
