const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  kind: {
    type: String,
    enum: ['lead', 'ai', 'assign', 'followup', 'application', 'conversion', 'alert'],
    required: true
  },
  text: { type: String, required: true },
  actor: { type: String, required: true },
  at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Activity', ActivitySchema);
