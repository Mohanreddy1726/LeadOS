const express = require('express');
const router = express.Router();
const FollowUp = require('../models/FollowUp');
const auth = require('../middleware/auth');

// Get follow-ups for user
router.get('/', auth, async (req, res) => {
  try {
    const { memberId } = req.user;
    const followUps = await FollowUp.find({ memberId }).sort({ date: 1 });
    res.json(followUps);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add follow-up
router.post('/', auth, async (req, res) => {
  try {
    const followUp = new FollowUp(req.body);
    await followUp.save();
    res.status(201).json(followUp);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Complete follow-up
router.patch('/:id/complete', auth, async (req, res) => {
  try {
    const followUp = await FollowUp.findByIdAndUpdate(req.params.id, { status: 'Completed' }, { new: true });
    res.json(followUp);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
