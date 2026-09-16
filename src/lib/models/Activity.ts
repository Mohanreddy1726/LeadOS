import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  kind: 'lead' | 'ai' | 'assign' | 'followup' | 'application' | 'conversion' | 'alert';
  text: string;
  actor: string;
  at: Date;
}

const ActivitySchema = new Schema<IActivity>({
  kind: {
    type: String,
    enum: ['lead', 'ai', 'assign', 'followup', 'application', 'conversion', 'alert'],
    required: true
  },
  text: { type: String, required: true },
  actor: { type: String, required: true },
  at: { type: Date, default: Date.now },
});

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
