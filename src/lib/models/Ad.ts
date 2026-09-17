import mongoose, { Schema, Document } from 'mongoose';

export interface IAd extends Document {
  name: string;
  platform: string;
  metaAdId?: string;
  adSetId: string;
  campaignId: string;
  status?: string;
  reach?: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  createdAt: Date;
}

const AdSchema = new Schema<IAd>({
  name: { type: String, required: true },
  platform: { type: String, required: true },
  metaAdId: { type: String },
  adSetId: { type: String, required: true },
  campaignId: { type: String, required: true },
  status: { type: String },
  reach: { type: Number, default: 0 },
  spend: { type: Number, default: 0 },
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Ad || mongoose.model<IAd>('Ad', AdSchema);
