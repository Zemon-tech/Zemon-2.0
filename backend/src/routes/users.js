const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all users (requires authentication)
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching users...');
    const users = await User.find(
      {}, // Get all users
      'name email role' // Only return necessary fields
    ).sort({ name: 1 });
    
    console.log(`Found ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router; 