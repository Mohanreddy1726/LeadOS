const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get team members
router.get('/', auth, async (req, res) => {
  try {
    const { role } = req.user;
    let query = {};
    if (role === 'manager') {
      query = { role: 'telecaller' };
    } else if (role === 'telecaller') {
      return res.status(403).json({ message: 'Not authorized to view team' });
    }
    const members = await User.find(query).select('-password');
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
