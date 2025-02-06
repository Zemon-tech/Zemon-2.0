const mongoose = require('mongoose');

const stageSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  stageName: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  is_completed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Compound index to ensure unique combination of taskId and stageName
stageSchema.index({ taskId: 1, stageName: 1 }, { unique: true });

const Stage = mongoose.model('Stage', stageSchema);

module.exports = Stage; 