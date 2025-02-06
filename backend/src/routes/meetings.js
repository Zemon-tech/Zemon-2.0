const express = require('express');
const Meeting = require('../models/Meeting');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all meetings for user
router.get('/', auth, async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [
        { createdBy: req.user._id },
        { 'participants.user': req.user._id }
      ]
    })
      .populate('createdBy', 'name email')
      .populate('participants.user', 'name email')
      .sort({ date: 1 });
    
    res.json(meetings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create meeting
router.post('/', auth, async (req, res) => {
  try {
    const meeting = new Meeting({
      ...req.body,
      createdBy: req.user._id
    });

    await meeting.save();
    await meeting.populate('participants.user', 'name email');
    
    // Emit socket event for real-time updates
    const io = req.app.get('io');
    meeting.participants.forEach(participant => {
      io.to(`user_${participant.user._id}`).emit('newMeeting', meeting);
    });

    // TODO: Send email notifications to participants
    
    res.status(201).json(meeting);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update meeting
router.put('/:id', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    Object.assign(meeting, req.body);
    await meeting.save();
    await meeting.populate('participants.user', 'name email');

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    meeting.participants.forEach(participant => {
      io.to(`user_${participant.user._id}`).emit('meetingUpdated', meeting);
    });

    res.json(meeting);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Respond to meeting invitation
router.post('/:id/respond', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      'participants.user': req.user._id
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const participant = meeting.participants.find(
      p => p.user.toString() === req.user._id.toString()
    );
    participant.status = status;

    await meeting.save();
    await meeting.populate('participants.user', 'name email');

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.to(`user_${meeting.createdBy}`).emit('meetingResponseUpdated', {
      meetingId: meeting._id,
      userId: req.user._id,
      status
    });

    res.json(meeting);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete meeting
router.delete('/:id', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    meeting.participants.forEach(participant => {
      io.to(`user_${participant.user}`).emit('meetingCancelled', meeting._id);
    });

    res.json({ message: 'Meeting cancelled successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 