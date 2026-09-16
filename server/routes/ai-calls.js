const express = require('express');
const router = express.Router();
const AiCall = require('../models/AiCall');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const calls = await AiCall.find().sort({ at: -1 });
    res.json(calls);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
