const mongoose = require('mongoose');

const AiCallSchema = new mongoose.Schema({
  leadId: { type: String, required: true },
  status: {
    type: String,
    enum: ['Completed', 'Failed', 'No Answer', 'Busy'],
    required: true
  },
  durationSec: { type: Number, default: 0 },
  score: { type: Number },
  transcript: { type: String },
  at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AiCall', AiCallSchema);
