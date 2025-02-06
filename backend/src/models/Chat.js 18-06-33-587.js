const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['group', 'direct'],
    required: true
  },
  name: {
    type: String,
    required: function() { return this.type === 'group'; },
    trim: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  messages: [messageSchema],
  lastMessage: {
    type: messageSchema
  },
  groupType: {
    type: String,
    enum: ['web-dev', 'devops', 'aiml'],
    required: function() { return this.type === 'group'; }
  }
}, {
  timestamps: true
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat; 