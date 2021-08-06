import React, { useState, useEffect } from 'react';
import { css } from '@stitches/react';

import '../App.global.css';
import { motion } from 'framer-motion';

import AccordionItem from './AccordionItem';
import { useAuth } from '../contexts/AuthContext';
import colors from '../config/colors';
import { getObjectByProp } from '../helpers/arrayTools';
import DAO from '../config/dao';

const container = css({ backgroundColor: colors.classyWhite });

const searchInputStyle = css({
  WebkitAppearance: 'none',
  outline: 'none',
  border: 'none',
  backgroundColor: 'transparent',

  fontSize: '1.0em',
  fontWeight: 600,

  width: '100%',
  padding: 15,
  paddingLeft: 30,
  paddingRight: 30,
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

  // Get friends
  useEffect(() => {
    DAO.getFriends(currentUser)
      .then((res) => {
        console.log(res);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  return (
    <div className={container()}>
      {friends.length ? (
        !findFriendsVisible &&
        filteredFriends.map((friend) => <AccordionItem friend={friend} />)
      ) : (
        <div className={container()}>
          <h1>you have no friends Sadge</h1>
        </div>
      )}

      {searchValue && (
        <div onClick={handleFindButtonClick} className={findButton()}>
          Find '{searchValue}'
        </div>
      )}
      <input
        placeholder="Find friends..."
        type="text"
        value={searchValue || ''}
        onChange={handleSearchInput}
        className={searchInputStyle()}
      />
    </div>
  );
}
