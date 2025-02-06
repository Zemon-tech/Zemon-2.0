const Stage = require('../models/Stage');
const Task = require('../models/Task');

// Get all stages for a task
exports.getTaskStages = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Get stages with completion status
    const stages = await Stage.find({ taskId: req.params.taskId })
      .select('stageName is_completed')
      .sort({ stageName: 1 });

    res.json(stages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Save or update stage content
exports.saveStageContent = async (req, res) => {
  try {
    const { taskId, stageName, content } = req.body;

    // Verify task exists and stage is valid
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    if (!task.stages.includes(stageName)) {
      return res.status(400).json({ error: 'Invalid stage name' });
    }

    // Update or create stage content
    const stage = await Stage.findOneAndUpdate(
      { taskId, stageName },
      { content },
      { upsert: true, new: true }
    );

    res.json(stage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get content for a specific stage
exports.getStageContent = async (req, res) => {
  try {
    const { taskId, stageName } = req.params;

    // Verify task exists and stage is valid
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    if (!task.stages.includes(stageName)) {
      return res.status(400).json({ error: 'Invalid stage name' });
    }

    // Get stage content
    const stage = await Stage.findOne({ taskId, stageName });
    if (!stage) {
      return res.json({ content: '', is_completed: false }); // Return empty content if stage doesn't exist yet
    }

    res.json(stage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 