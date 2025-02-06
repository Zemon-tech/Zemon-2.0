const Project = require('../models/Project');

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single project
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a project
exports.createProject = async (req, res) => {
  try {
    console.log('Received project creation request:', {
      body: req.body,
      user: req.user
    });

    const { title, image_url, timeline_entries } = req.body;

    if (!title || !image_url) {
      return res.status(400).json({ 
        message: 'Title and image URL are required',
        received: req.body
      });
    }

    const project = new Project({
      title,
      image_url,
      timeline_entries: timeline_entries || [],
      user: req.user._id // Use the authenticated user's ID
    });

    console.log('Creating project:', project);
    const newProject = await project.save();
    console.log('Project created successfully:', newProject);
    
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Project creation error:', error);
    res.status(400).json({ 
      message: 'Failed to create project',
      error: error.message,
      details: error.errors ? Object.keys(error.errors).reduce((acc, key) => {
        acc[key] = error.errors[key].message;
        return acc;
      }, {}) : undefined
    });
  }
};

// Update a project
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (req.body.title) project.title = req.body.title;
    if (req.body.image_url) project.image_url = req.body.image_url;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    await project.remove();
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add timeline entry
exports.addTimelineEntry = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.timeline_entries.push({
      date: req.body.date,
      title: req.body.title,
      description: req.body.description
    });

    const updatedProject = await project.save();
    res.status(201).json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update timeline entry
exports.updateTimelineEntry = async (req, res) => {
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

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete timeline entry
exports.deleteTimelineEntry = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.timeline_entries = project.timeline_entries.filter(
      entry => entry.id !== req.params.entryId
    );

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 