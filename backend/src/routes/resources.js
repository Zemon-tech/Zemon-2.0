const express = require('express');
const Resource = require('../models/Resource');
const auth = require('../middleware/auth');
const { isAdminOrTeamLeader } = require('../middleware/isAdmin');
const resourceController = require('../controllers/resourceController');

const router = express.Router();

// Get all resources with filtering and search
router.get('/', auth, resourceController.getResources);

// Create resource
router.post('/', auth, isAdminOrTeamLeader, resourceController.createResource);

// Update resource
router.put('/:id', auth, isAdminOrTeamLeader, resourceController.updateResource);

// Like/Unlike resource
router.post('/:id/like', auth, resourceController.toggleLike);

// Increment view count
router.post('/:id/view', auth, resourceController.incrementViews);

// Delete resource
router.delete('/:id', auth, isAdminOrTeamLeader, resourceController.deleteResource);

module.exports = router; 