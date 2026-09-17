import mongoose, { Schema, Document } from 'mongoose';

export interface ISyncLog extends Document {
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  createdAt: Date;
}

const SyncLogSchema = new Schema<ISyncLog>({
  level: { type: String, required: true, enum: ['INFO', 'WARN', 'ERROR'] },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.SyncLog || mongoose.model<ISyncLog>('SyncLog', SyncLogSchema);
