import mongoose, { Schema, Document } from 'mongoose';

export interface IAiCall extends Document {
  leadId: string;
  status: 'Completed' | 'Failed' | 'No Answer' | 'Busy';
  durationSec: number;
  score?: number;
  transcript?: string;
  at: Date;
}

const AiCallSchema = new Schema<IAiCall>({
  leadId: { type: String, required: true },
  status: {
    type: String,
    enum: ['Completed', 'Failed', 'No Answer', 'Busy'],
    required: true
  },
  durationSec: { type: Number, default: 0 },
  score: { type: Number },
  transcript: { type: String },
  at: { type: Date, default: Date.now },
});

export default mongoose.models.AiCall || mongoose.model<IAiCall>('AiCall', AiCallSchema);
