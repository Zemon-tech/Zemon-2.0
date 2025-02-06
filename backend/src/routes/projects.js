const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const { isAdminOrTeamLeader } = require('../middleware/roles');

const router = express.Router();

// Get all projects
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
    
    res.json(projects);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('user', 'name email role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create project
router.post('/', auth, isAdminOrTeamLeader, async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      user: req.user._id
    });

    await project.save();
    await project.populate('user', 'name email');
    
    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.emit('newProject', project);
    
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update project
router.put('/:id', auth, isAdminOrTeamLeader, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Update only allowed fields
    if (req.body.title) project.title = req.body.title;
    if (req.body.image_url) project.image_url = req.body.image_url;

    await project.save();
    
    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.emit('projectUpdated', project);

    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete project
router.delete('/:id', auth, isAdminOrTeamLeader, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.deleteOne();

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.emit('projectDeleted', { projectId: req.params.id });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add task to stage
router.post('/:id/stages/:stageName/tasks', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const stage = project.stages.find(s => s.name === req.params.stageName);
    if (!stage) {
      return res.status(404).json({ error: 'Stage not found' });
    }

    const task = new Task({
      ...req.body,
      createdBy: req.user._id
    });

    await task.save();
    stage.tasks.push(task._id);
    
    await project.calculateProgress();
    await project.save();
    
    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.emit('projectUpdated', project);

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Move task between stages
router.put('/:id/tasks/:taskId/move', auth, async (req, res) => {
  try {
    const { fromStage, toStage } = req.body;
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const sourceStage = project.stages.find(s => s.name === fromStage);
    const targetStage = project.stages.find(s => s.name === toStage);

    if (!sourceStage || !targetStage) {
      return res.status(404).json({ error: 'Stage not found' });
    }

    // Move task between stages
    sourceStage.tasks = sourceStage.tasks.filter(id => id.toString() !== req.params.taskId);
    targetStage.tasks.push(req.params.taskId);

    await project.save();
    await project.populate({
      path: 'stages.tasks',
      populate: {
        path: 'assignees',
        select: 'name email'
      }
    });

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.emit('taskMoved', {
      projectId: project._id,
      taskId: req.params.taskId,
      fromStage,
      toStage
    });

    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update project status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    project.status = req.body.status;
    await project.save();

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.emit('projectStatusUpdated', {
      projectId: project._id,
      status: project.status
    });

    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add timeline entry
router.post('/:id/timeline', auth, isAdminOrTeamLeader, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { date, title, description } = req.body;
    
    if (!date || !title || !description) {
      return res.status(400).json({ message: 'Date, title and description are required' });
    }

    project.timeline_entries.push({
      date,
      title,
      description
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update timeline entry
router.patch('/:projectId/timeline/:entryId', auth, isAdminOrTeamLeader, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const entry = project.timeline_entries.id(req.params.entryId);
    if (!entry) {
      return res.status(404).json({ message: 'Timeline entry not found' });
    }

    if (req.body.date) entry.date = req.body.date;
    if (req.body.title) entry.title = req.body.title;
    if (req.body.description) entry.description = req.body.description;

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete timeline entry
router.delete('/:projectId/timeline/:entryId', auth, isAdminOrTeamLeader, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.timeline_entries = project.timeline_entries.filter(
      entry => entry._id.toString() !== req.params.entryId
    );

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 