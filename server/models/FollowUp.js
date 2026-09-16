const mongoose = require('mongoose');

const FollowUpSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  memberId: { type: String, required: true },
  date: { type: String, required: true },
  text: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Today'],
    default: 'Pending'
  },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FollowUp', FollowUpSchema);
