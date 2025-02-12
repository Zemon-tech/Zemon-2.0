const Music = require('../models/Music');

// Get all music
exports.getAllMusic = async (req, res) => {
  try {
    const music = await Music.find({ isActive: true })
      .populate('addedBy', 'name email')
      .sort('-createdAt');
    res.json(music);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add new music (admin only)
exports.addMusic = async (req, res) => {
  try {
    const { title, embedCode } = req.body;
    
    // Basic validation of embed code
    if (!embedCode.includes('iframe') || !embedCode.includes('soundcloud')) {
      return res.status(400).json({ error: 'Invalid SoundCloud embed code' });
    }

    const music = new Music({
      title,
      embedCode,
      addedBy: req.user._id
    });

    await music.save();
    await music.populate('addedBy', 'name email');

    // Emit socket event for real-time updates
    if (req.app.get('io')) {
      req.app.get('io').emit('newMusic', music);
    }

    res.status(201).json(music);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update music (admin only)
exports.updateMusic = async (req, res) => {
  try {
    const { title, embedCode, isActive } = req.body;
    const music = await Music.findById(req.params.id);

    if (!music) {
      return res.status(404).json({ error: 'Music not found' });
    }

    if (title) music.title = title;
    if (embedCode) {
      if (!embedCode.includes('iframe') || !embedCode.includes('soundcloud')) {
        return res.status(400).json({ error: 'Invalid SoundCloud embed code' });
      }
      music.embedCode = embedCode;
    }
    if (typeof isActive === 'boolean') music.isActive = isActive;

    await music.save();
    await music.populate('addedBy', 'name email');

    // Emit socket event for real-time updates
    if (req.app.get('io')) {
      req.app.get('io').emit('musicUpdated', music);
    }

    res.json(music);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete music (admin only)
exports.deleteMusic = async (req, res) => {
  try {
    const music = await Music.findByIdAndDelete(req.params.id);

    if (!music) {
      return res.status(404).json({ error: 'Music not found' });
    }

    // Emit socket event for real-time updates
    if (req.app.get('io')) {
      req.app.get('io').emit('musicDeleted', req.params.id);
    }

    res.json({ message: 'Music deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 