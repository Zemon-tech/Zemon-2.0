const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const taskController = require('../controllers/taskController');
const stageController = require('../controllers/stageController');

const router = express.Router();

// Middleware to check if user is admin or team-leader
const isAdminOrTeamLeader = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'team-leader') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Only admins and team leaders can perform this action.' });
  }
};

// Get all tasks
router.get('/', auth, taskController.getTasks);

// Get task status history
router.get('/status-history', auth, taskController.getTaskStatusHistory);

// Create task - only admin and team-leader can create
router.post('/', auth, isAdminOrTeamLeader, taskController.createTask);

// Update task - admin, team-leader, or assigned user can update
router.put('/:id', auth, taskController.updateTask);

// Delete task - only admin and team-leader can delete
router.delete('/:id', auth, isAdminOrTeamLeader, taskController.deleteTask);

// Get task by ID
router.get('/:taskId', auth, taskController.getTaskById);

// Update task stage
router.put('/:taskId/stage', auth, taskController.updateTaskStage);

// Stage-related routes
router.get('/:taskId/stages', auth, stageController.getTaskStages);

// Save stage content - admin, team-leader, or assigned user can save
router.post('/stage-content', auth, async (req, res) => {
  try {
    const { taskId, stageName, content } = req.body;
    
    // Validate required fields
    if (!taskId || !stageName) {
      return res.status(400).json({ error: 'Task ID and stage name are required' });
    }

    // Check if user has permission
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const canEdit = req.user.role === 'admin' || 
                   req.user.role === 'team-leader' ||
                   task.assignees.includes(req.user._id);

    if (!canEdit) {
      return res.status(403).json({ error: 'Not authorized to edit this task' });
    }

    await stageController.saveStageContent(req, res);
  } catch (error) {
    console.error('Error saving stage content:', error);
    res.status(500).json({ error: 'Failed to save stage content' });
  }
});

// Get stage content
router.get('/:taskId/stage-content/:stageName', auth, async (req, res) => {
  try {
    const { taskId, stageName } = req.params;
    
    // Validate parameters
    if (!taskId || !stageName) {
      return res.status(400).json({ error: 'Task ID and stage name are required' });
    }

    // Check if user has permission to view
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const canView = req.user.role === 'admin' || 
                   req.user.role === 'team-leader' ||
                   task.assignees.includes(req.user._id);

    if (!canView) {
      return res.status(403).json({ error: 'Not authorized to view this task' });
    }

    await stageController.getStageContent(req, res);
  } catch (error) {
    console.error('Error getting stage content:', error);
    res.status(500).json({ error: 'Failed to get stage content' });
  }
});

module.exports = router; 