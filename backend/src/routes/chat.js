const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');
const Chat = require('../models/Chat');

// Apply auth middleware to all chat routes
router.use(auth);

// Chat routes
router.get('/', chatController.getChats);
router.post('/', chatController.createChat);
router.get('/users', chatController.getAvailableUsers);
router.post('/:chatId/messages', chatController.sendMessage);
router.delete('/:chatId', chatController.deleteChat);

// Group member management routes
router.post('/:chatId/members', chatController.addGroupMembers);
router.delete('/:chatId/members/:userId', chatController.removeGroupMember);

// Mark messages as read
router.post('/:chatId/read', async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Mark all messages as read
    chat.messages.forEach(message => {
      if (!message.readBy.includes(req.user._id)) {
        message.readBy.push(req.user._id);
      }
    });

    await chat.save();
    await chat.populate('messages.readBy', 'name');

    res.json(chat);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 