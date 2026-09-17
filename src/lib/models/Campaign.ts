import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
  name: string;
  platform: string;
  metaCampaignId?: string;
  status?: string;
  reach?: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  budget?: number;
  createdAt: Date;
}

const CampaignSchema = new Schema<ICampaign>({
  name: { type: String, required: true },
  platform: { type: String, required: true },
  metaCampaignId: { type: String },
  status: { type: String },
  reach: { type: Number, default: 0 },
  spend: { type: Number, default: 0 },
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  budget: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', CampaignSchema);
