const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  leadId: { type: String, required: true },
  stage: {
    type: String,
    enum: ['Interested', 'Application Started', 'Documents Pending', 'Documents Submitted', 'Application Submitted', 'Offer Received', 'Deposit Paid', 'Converted'],
    required: true
  },
  value: { type: Number, default: 0 },
  ownerId: { type: String, required: true },
  lastActivity: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Application', ApplicationSchema);
