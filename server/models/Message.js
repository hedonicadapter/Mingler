const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Types.ObjectId,
      ref: 'Conversation',
    },
    fromID: {
      type: mongoose.Types.ObjectId,
      required: [true, 'fromID not supplied.'],
    },
    message: {
      type: String,
      required: [true, 'No message content.'],
    },
    sentDate: Date,
  }
  // { timestamps: true }
);

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
