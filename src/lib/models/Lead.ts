import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  name: string;
  email: string;
  phone: string;
  budget?: string;
  program?: string;
  academic?: string;
  intake?: string;
  quality: 'hot' | 'warm' | 'cold' | 'junk';
  score: number;
  stage: 'New' | 'Contacted' | 'Interested' | 'Qualified' | 'Applied' | 'Converted' | 'Junk';
  assignedTo?: string;
  managerId?: string;
  campaignId?: string;
  metaCampaignId?: string;
  metaAdSetId?: string;
  metaAdId?: string;
  aiSummary?: string;
  createdAt: Date;
}

const LeadSchema = new Schema<ILead>({
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
  assignedTo: { type: String },
  managerId: { type: String },
  campaignId: { type: String },
  metaCampaignId: { type: String },
  metaAdSetId: { type: String },
  metaAdId: { type: String },
  aiSummary: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);
