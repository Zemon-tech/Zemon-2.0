const Idea = require('../models/Idea');

// Get all ideas
exports.getIdeas = async (req, res) => {
  try {
    const ideas = await Idea.find()
      .populate('createdBy', 'name email')
      .populate('votes', 'name')
      .populate('comments.userId', 'name');
    
    res.json(ideas);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Create idea
exports.createIdea = async (req, res) => {
  try {
    const idea = new Idea({
      ...req.body,
      createdBy: req.user._id,
      votes: []
    });

    await idea.save();
    await idea.populate('createdBy', 'name email');
    
    // Emit socket event for real-time updates
    req.app.get('io').emit('newIdea', idea);
    
    res.status(201).json(idea);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete idea
exports.deleteIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    
    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    // Only allow admins, team leaders, or the creator to delete
    if (req.user.role !== 'admin' && 
        req.user.role !== 'team-leader' && 
        !idea.createdBy.equals(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to delete this idea' });
    }

    await idea.deleteOne();
    
    // Emit socket event for real-time updates
    req.app.get('io').emit('ideaDeleted', idea._id);
    
    res.json({ message: 'Idea deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Vote on idea
exports.voteIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    const hasVoted = idea.votes.includes(req.user._id);
    if (hasVoted) {
      idea.votes = idea.votes.filter(id => !id.equals(req.user._id));
    } else {
      idea.votes.push(req.user._id);
    }

    await idea.save();
    await idea.populate('createdBy', 'name email');
    await idea.populate('votes', 'name');
    await idea.populate('comments.userId', 'name');
    
    // Emit socket event for real-time updates
    req.app.get('io').emit('ideaVoted', idea);
    
    res.json(idea);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Add comment
exports.addComment = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    idea.comments.push({
      userId: req.user._id,
      comment: req.body.comment
    });

    await idea.save();
    await idea.populate('comments.userId', 'name');
    
    // Emit socket event for real-time updates
    req.app.get('io').emit('newComment', idea);
    
    res.json(idea);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 