const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    })
    .populate('participants', 'name email')
    .populate({
      path: 'messages',
      populate: { 
        path: 'sender', 
        select: 'name email' 
      }
    });
    
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};

exports.createChat = async (req, res) => {
  try {
    const { participants, name, type = 'direct' } = req.body;
    
    // Add current user to participants if not included
    const allParticipants = [...new Set([...participants, req.user._id])];

    // For direct chats, ensure exactly 2 participants
    if (type === 'direct' && allParticipants.length !== 2) {
      return res.status(400).json({ error: 'Direct chats must have exactly 2 participants' });
    }

    // Check if direct chat already exists
    if (type === 'direct') {
      const existingChat = await Chat.findOne({
        type: 'direct',
        participants: { $all: allParticipants }
      });

      if (existingChat) {
        return res.status(400).json({ error: 'Chat already exists' });
      }
    }

    const chat = new Chat({
      type,
      name: type === 'group' ? name : undefined,
      participants: allParticipants
    });

    await chat.save();
    await chat.populate('participants', 'name email');

    res.status(201).json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found or not a member' });
    }

    const message = new Message({
      chat: chat._id,
      sender: req.user._id,
      content: req.body.content
    });

    await message.save();
    
    // Add message to chat's messages array
    chat.messages.push(message._id);
    
    // Update chat's lastMessage
    chat.lastMessage = {
      content: message.content,
      sender: req.user._id,
      createdAt: message.createdAt
    };
    
    await chat.save();
    
    // Populate necessary fields
    await message.populate('sender', 'name email');

    res.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

exports.getAvailableUsers = async (req, res) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.user._id } },
      'name email'
    ).sort('name');
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching available users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({
      _id: req.params.chatId,
      participants: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Delete all messages for this chat
    await Message.deleteMany({ chat: chat._id });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
};

exports.addGroupMembers = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      type: 'group',
      participants: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ error: 'Group chat not found' });
    }

    const { userIds } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'Invalid user IDs provided' });
    }

    // Add new participants
    chat.participants = [...new Set([...chat.participants, ...userIds])];
    await chat.save();
    await chat.populate('participants', 'name email');

    res.json(chat);
  } catch (error) {
    console.error('Error adding group members:', error);
    res.status(500).json({ error: 'Failed to add members' });
  }
};

exports.removeGroupMember = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      type: 'group',
      participants: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ error: 'Group chat not found' });
    }

    const memberIdToRemove = req.params.userId;
    
    // Remove the member
    chat.participants = chat.participants.filter(
      p => p.toString() !== memberIdToRemove
    );
    
    await chat.save();
    await chat.populate('participants', 'name email');

    res.json(chat);
  } catch (error) {
    console.error('Error removing group member:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
}; 