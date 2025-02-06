const Resource = require('../models/Resource');

// Get all resources
exports.getResources = async (req, res) => {
  try {
    const { type, tags, search, sort = '-createdAt' } = req.query;
    const query = {};

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by tags
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    // Search in title, description, and tags
    if (search) {
      query.$text = { $search: search };
    }

    const resources = await Resource.find(query)
      .populate('uploadedBy', 'name email')
      .populate('likes', 'name')
      .sort(sort);
    
    res.json(resources);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Create resource
exports.createResource = async (req, res) => {
  try {
    const resource = new Resource({
      ...req.body,
      uploadedBy: req.user._id,
      likes: []
    });

    await resource.save();
    await resource.populate('uploadedBy', 'name email');
    
    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.emit('newResource', resource);
    
    res.status(201).json(resource);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update resource
exports.updateResource = async (req, res) => {
  try {
    // Allow admins and team leaders to update any resource
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin' && req.user.role !== 'team-leader') {
      query.uploadedBy = req.user._id;
    }

    const resource = await Resource.findOne(query);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const allowedUpdates = ['title', 'description', 'url', 'tags', 'type'];
    Object.keys(req.body).forEach(update => {
      if (allowedUpdates.includes(update)) {
        resource[update] = req.body[update];
      }
    });

    await resource.save();
    await resource.populate('uploadedBy', 'name email');
    await resource.populate('likes', 'name');

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.emit('resourceUpdated', resource);

    res.json(resource);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete resource
exports.deleteResource = async (req, res) => {
  try {
    // Allow admins and team leaders to delete any resource
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin' && req.user.role !== 'team-leader') {
      query.uploadedBy = req.user._id;
    }

    const resource = await Resource.findOneAndDelete(query);

    if (!resource) {
      return res.status(404).json({ 
        error: 'Resource not found',
        message: 'The resource you are trying to delete does not exist or has already been deleted.'
      });
    }
    
    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.emit('resourceDeleted', resource._id);

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      error: error.message,
      message: 'Failed to delete resource. Please try again.'
    });
  }
};

// Like/Unlike resource
exports.toggleLike = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const hasLiked = resource.likes.includes(req.user._id);
    if (hasLiked) {
      resource.likes = resource.likes.filter(id => !id.equals(req.user._id));
    } else {
      resource.likes.push(req.user._id);
    }

    await resource.save();
    await resource.populate('likes', 'name');

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.emit('resourceLiked', {
      resourceId: resource._id,
      likes: resource.likes
    });

    res.json(resource);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Increment view count
exports.incrementViews = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json({ views: resource.views });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 