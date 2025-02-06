const Task = require('../models/Task');
const Stage = require('../models/Stage');

// Get all tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [
        { createdBy: req.user._id },
        { assignees: req.user._id },
        { teamLeader: req.user._id }
      ]
    })
    .populate('assignees', 'name email')
    .populate('teamLeader', 'name email');
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    console.log('Updating task:', req.params.id);
    console.log('Update data:', req.body);

    const task = await Task.findOne({
      _id: req.params.id,
      $or: [
        { createdBy: req.user._id },
        { assignees: req.user._id }
      ]
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Log current status history
    console.log('Current status history:', task.statusHistory);

    // If status is being updated, add to status history
    if (req.body.status && req.body.status !== task.status) {
      console.log(`Status change detected: ${task.status} -> ${req.body.status}`);
      
      // Initialize statusHistory if it doesn't exist
      if (!task.statusHistory) {
        task.statusHistory = [];
      }

      // Add status change to history
      const statusChange = {
        status: req.body.status,
        updatedBy: req.user._id,
        updatedAt: new Date()
      };
      task.statusHistory.push(statusChange);
      console.log('Added new status history entry:', statusChange);
    }

    // Update task fields
    Object.assign(task, req.body);
    task.updatedBy = req.user._id; // Track who made the update

    // Save and log the updated task
    const savedTask = await task.save();
    console.log('Updated status history after save:', savedTask.statusHistory);

    await task.populate('assignees', 'name email');
    await task.populate('statusHistory.updatedBy', 'name');

    console.log('Task updated successfully');
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(400).json({ error: error.message });
  }
};

// Create task
exports.createTask = async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      createdBy: req.user._id,
      // Initialize status history with creation event
      statusHistory: [{
        status: 'created', // Special status for creation event
        updatedBy: req.user._id,
        updatedAt: new Date()
      }]
    });

    await task.save();
    await task.populate('assignees', 'name email');
    
    // Create stage documents for each stage
    const stagePromises = task.stages.map(stageName => {
      return Stage.create({
        taskId: task._id,
        stageName,
        content: '',
        is_completed: false
      });
    });

    await Promise.all(stagePromises);
    
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    // First find the task to get its details
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Create a deletion record in status history
    const deletionRecord = {
      task_title: task.title,
      user_name: req.user.name, // We'll need to populate this
      status: 'deleted',
      timestamp: new Date()
    };

    // Store the deletion record in a separate collection or temporary storage
    // since the task will be deleted
    const tasks = await Task.find()
      .select('title statusHistory')
      .populate('statusHistory.updatedBy', 'name');

    // Add the deletion record to the first task's status history
    // (we'll use this as a log keeper)
    if (tasks.length > 0) {
      const logKeeperTask = tasks[0];
      logKeeperTask.statusHistory.push({
        status: 'deleted',
        updatedBy: req.user._id,
        updatedAt: new Date(),
        deletedTaskTitle: task.title // Store the deleted task's title
      });
      await logKeeperTask.save();
    }

    // Delete all associated stages
    await Stage.deleteMany({ taskId: task._id });

    // Finally delete the task
    await task.deleteOne();

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('assignees', 'name email')
      .populate('teamLeader', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task details' });
  }
};

// Update task stage
exports.updateTaskStage = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { stage, isLastStage, isFirstStage } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Validate the stage is in the task's stages array
    if (!task.stages.includes(stage)) {
      return res.status(400).json({ error: 'Invalid stage' });
    }

    const currentIndex = task.stages.indexOf(task.stage);
    const newIndex = task.stages.indexOf(stage);

    // If moving forward, mark only previous stages as completed (not including the new stage)
    if (newIndex > currentIndex) {
      await Stage.updateMany(
        { 
          taskId: task._id,
          stageName: { $in: task.stages.slice(0, newIndex) }
        },
        { is_completed: true }
      );
    } 
    // If moving backward, mark current and next stages as not completed
    else if (newIndex < currentIndex) {
      await Stage.updateMany(
        {
          taskId: task._id,
          stageName: { $in: task.stages.slice(newIndex + 1) }
        },
        { is_completed: false }
      );
    }
    // If it's the last stage and explicitly marked
    else if (isLastStage) {
      await Stage.updateMany(
        {
          taskId: task._id,
          stageName: stage
        },
        { is_completed: true }
      );
    }
    // If it's the first stage and explicitly marked for uncomplete
    else if (isFirstStage) {
      await Stage.updateMany(
        {
          taskId: task._id,
          stageName: stage
        },
        { is_completed: false }
      );
    }

    task.stage = stage;
    await task.save();

    // Populate necessary fields
    await task.populate('assignees', 'name email');
    await task.populate('createdBy', 'name email');

    res.json(task);
  } catch (error) {
    console.error('Error updating task stage:', error);
    res.status(500).json({ error: 'Failed to update task stage' });
  }
};

// Get task status history
exports.getTaskStatusHistory = async (req, res) => {
  try {
    console.log('Fetching task status history...');
    
    const tasks = await Task.find()
      .select('title statusHistory')
      .populate('statusHistory.updatedBy', 'name')
      .sort({ 'statusHistory.updatedAt': -1 });

    console.log('Found tasks:', tasks.length);
    console.log('Tasks data:', JSON.stringify(tasks, null, 2));

    if (!tasks || tasks.length === 0) {
      console.log('No tasks found');
      return res.json([]);
    }

    // Flatten and format the history
    const history = tasks.reduce((acc, task) => {
      if (!task.statusHistory) {
        console.log(`Task ${task.title} has no status history`);
        return acc;
      }
      
      console.log(`Processing status history for task: ${task.title}`);
      console.log('Status history:', task.statusHistory);
      
      const taskHistory = task.statusHistory.map(h => ({
        task_title: task.title,
        user_name: h.updatedBy ? h.updatedBy.name : 'Unknown User',
        status: h.status,
        timestamp: h.updatedAt
      }));
      return [...acc, ...taskHistory];
    }, []);

    // Sort by timestamp descending
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    console.log('Final formatted history:', JSON.stringify(history, null, 2));
    res.json(history);
  } catch (error) {
    console.error('Error fetching task status history:', error);
    res.status(500).json({ error: 'Failed to fetch task status history', details: error.message });
  }
}; 