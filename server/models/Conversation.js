const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  messages: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Message',
    },
  ],
  users: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Conversations require one or more user IDs.'],
      unique: [true, 'User already exists in this conversation.'],
    },
  ],
});

const Conversation = mongoose.model('Conversation', ConversationSchema);

module.exports = Conversation;
