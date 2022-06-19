userIo.on('connection', async (socket) => {
  const userID = socket.handshake.query.userID;
  const user = await getUser(userID);

  let friendIDs = Object.values(user.friendIDs);

  // friendIDs remains the same, even after friendrequest:accept
  socket.on('activity:send', (packet) => onActivitySend(packet, friendIDs));

  socket.on('friendrequest:accept', ({ id }) => {
    friendIDs.push(id);
  });
});
