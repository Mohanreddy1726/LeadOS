import mongoose, { Schema, Document } from 'mongoose';

export interface IFollowUp extends Document {
  leadId: mongoose.Types.ObjectId;
  memberId: string;
  date: string;
  text: string;
  status: 'Pending' | 'Completed' | 'Today';
  priority: 'Low' | 'Medium' | 'High';
  createdAt: Date;
}

const FollowUpSchema = new Schema<IFollowUp>({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  memberId: { type: String, required: true },
  date: { type: String, required: true },
  text: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Today'],
    default: 'Pending'
  },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.FollowUp || mongoose.model<IFollowUp>('FollowUp', FollowUpSchema);
