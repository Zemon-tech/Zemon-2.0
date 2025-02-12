const express = require('express');
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');
const musicController = require('../controllers/musicController');

const router = express.Router();

// Get all music (accessible to all authenticated users)
router.get('/', auth, musicController.getAllMusic);

// Admin only routes
router.post('/', auth, isAdmin, musicController.addMusic);
router.put('/:id', auth, isAdmin, musicController.updateMusic);
router.delete('/:id', auth, isAdmin, musicController.deleteMusic);

module.exports = router; 