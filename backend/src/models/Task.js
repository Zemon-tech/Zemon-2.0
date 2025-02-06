const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  assignees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  category: {
    type: String
  },
  tags: [String],
  stages: {
    type: [String],
    required: true,
    default: ['Planning', 'Development', 'Review', 'Testing', 'Deployment']
  },
  stage: {
    type: String,
    required: true,
    default: 'Planning',
    validate: {
      validator: function(value) {
        return this.stages.includes(value);
      },
      message: 'Stage must be one of the defined stages'
    }
  },
  stageDescriptions: {
    type: Map,
    of: String,
    default: {
      'Planning': 'Initial planning and requirement gathering phase',
      'Development': 'Active development and implementation phase',
      'Review': 'Code review and initial testing phase',
      'Testing': 'Comprehensive testing and bug fixing phase',
      'Deployment': 'Final deployment and release phase'
    }
  },
  stageHistory: [{
    stage: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  statusHistory: [{
    status: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teamLeader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Update the pre-save middleware
taskSchema.pre('save', function(next) {
  console.log('Pre-save middleware triggered');
  console.log('Is status modified:', this.isModified('status'));
  console.log('Current status:', this.status);
  console.log('Current status history:', this.statusHistory);

  if (this.isModified('stage')) {
    // Initialize stageHistory if it doesn't exist
    if (!this.stageHistory) {
      this.stageHistory = [];
    }
    
    this.stageHistory.push({
      stage: this.stage,
      updatedBy: this.updatedBy || this.createdBy,
      updatedAt: new Date()
    });
  }

  next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task; 