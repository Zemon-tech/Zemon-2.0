const express = require('express');
const Idea = require('../models/Idea');
const auth = require('../middleware/auth');
const { isAdminOrTeamLeader } = require('../middleware/isAdmin');
const ideaController = require('../controllers/ideaController');

const router = express.Router();

// Public routes
router.get('/', auth, ideaController.getIdeas);
router.post('/', auth, ideaController.createIdea);

// Vote and comment routes
router.post('/:id/vote', auth, ideaController.voteIdea);
router.post('/:id/comment', auth, ideaController.addComment);

// Protected routes (Admin and Team Leader only)
router.delete('/:id', auth, isAdminOrTeamLeader, ideaController.deleteIdea);

module.exports = router; 