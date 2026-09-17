import mongoose, { Schema, Document } from 'mongoose';

export interface IAdSet extends Document {
  name: string;
  platform: string;
  metaAdSetId?: string;
  campaignId: string;
  status?: string;
  reach?: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  budget?: number;
  createdAt: Date;
}

const AdSetSchema = new Schema<IAdSet>({
  name: { type: String, required: true },
  platform: { type: String, required: true },
  metaAdSetId: { type: String },
  campaignId: { type: String, required: true },
  status: { type: String },
  reach: { type: Number, default: 0 },
  spend: { type: Number, default: 0 },
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  budget: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.AdSet || mongoose.model<IAdSet>('AdSet', AdSetSchema);
