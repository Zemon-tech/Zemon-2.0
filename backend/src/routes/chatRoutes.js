const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getChats,
  createChat,
  sendMessage,
  getAvailableUsers,
  deleteChat,
  addGroupMembers,
  removeGroupMember
} = require('../controllers/chatController');

router.use(protect);

router.route('/')
  .get(getChats)
  .post(createChat);

router.get('/users', getAvailableUsers);

router.route('/:chatId')
  .delete(deleteChat);

router.post('/:chatId/messages', sendMessage);

// Group member management routes
router.post('/:chatId/members', addGroupMembers);
router.delete('/:chatId/members/:userId', removeGroupMember);

module.exports = router; 