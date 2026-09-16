const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const auth = require('../middleware/auth');

// Get leads based on role and memberId
router.get('/', auth, async (req, res) => {
  try {
    const { role, memberId } = req.user;
    let query = {};

    if (role === 'telecaller') {
      query = { assignedTo: memberId };
    } else if (role === 'manager') {
      query = { 
        $or: [
          { assignedTo: { $exists: false } },
          { managerId: memberId }
        ]
      };
    }
    // admin sees all

    const leads = await Lead.find(query).sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update lead stage
router.patch('/:id/stage', auth, async (req, res) => {
  try {
    const { stage } = req.body;
    const lead = await Lead.findByIdAndUpdate(req.params.id, { stage }, { new: true });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Assign lead
router.post('/assign', auth, async (req, res) => {
  try {
    const { ids, callerId } = req.body;
    // In a real app, we'd fetch the caller's managerId from User model
    const updates = ids.map(id => Lead.findByIdAndUpdate(id, { 
      assignedTo: callerId, 
      stage: 'Assigned' 
    }));
    await Promise.all(updates);
    res.json({ message: 'Leads assigned successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
