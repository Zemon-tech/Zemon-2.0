const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { isAdminOrTeamLeader } = require('../middleware/roles');
const {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addTimelineEntry,
  updateTimelineEntry,
  deleteTimelineEntry
} = require('../controllers/projectController');

// Project routes
router.get('/', auth, getAllProjects);
router.get('/:id', auth, getProject);
router.post('/', auth, isAdminOrTeamLeader, createProject);
router.patch('/:id', auth, isAdminOrTeamLeader, updateProject);
router.delete('/:id', auth, isAdminOrTeamLeader, deleteProject);

// Timeline entry routes
router.post('/:id/timeline', auth, isAdminOrTeamLeader, addTimelineEntry);
router.patch('/:projectId/timeline/:entryId', auth, isAdminOrTeamLeader, updateTimelineEntry);
router.delete('/:projectId/timeline/:entryId', auth, isAdminOrTeamLeader, deleteTimelineEntry);

module.exports = router; 