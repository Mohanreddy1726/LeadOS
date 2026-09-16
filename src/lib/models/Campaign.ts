import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
  name: string;
  platform: string;
  spend: number;
  budget?: number;
  createdAt: Date;
}

const CampaignSchema = new Schema<ICampaign>({
  name: { type: String, required: true },
  platform: { type: String, required: true },
  spend: { type: Number, default: 0 },
  budget: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', CampaignSchema);
