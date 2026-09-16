const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  budget: { type: String },
  program: { type: String },
  academic: { type: String },
  intake: { type: String },
  quality: { 
    type: String, 
    enum: ['hot', 'warm', 'cold', 'junk'],
    default: 'warm'
  },
  score: { type: Number, default: 0 },
  stage: { 
    type: String, 
    enum: ['New', 'Contacted', 'Interested', 'Qualified', 'Applied', 'Converted', 'Junk'],
    default: 'New'
  },
  assignedTo: { type: String }, // memberId
  managerId: { type: String }, // memberId
  campaignId: { type: String },
  aiSummary: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Lead', LeadSchema);
