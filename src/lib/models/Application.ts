import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  leadId: string;
  stage: 'Interested' | 'Application Started' | 'Documents Pending' | 'Documents Submitted' | 'Application Submitted' | 'Offer Received' | 'Deposit Paid' | 'Converted';
  value: number;
  ownerId: string;
  lastActivity: Date;
}

const ApplicationSchema = new Schema<IApplication>({
  leadId: { type: String, required: true },
  stage: {
    type: String,
    enum: ['Interested', 'Application Started', 'Documents Pending', 'Documents Submitted', 'Application Submitted', 'Offer Received', 'Deposit Paid', 'Converted'],
    required: true
  },
  value: { type: Number, default: 0 },
  ownerId: { type: String, required: true },
  lastActivity: { type: Date, default: Date.now },
});

export default mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
