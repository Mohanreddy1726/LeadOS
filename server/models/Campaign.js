const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  platform: { type: String, required: true },
  spend: { type: Number, default: 0 },
  budget: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Campaign', CampaignSchema);
