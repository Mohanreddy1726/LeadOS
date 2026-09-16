import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  text: string;
  kind?: string;
  read: boolean;
  at: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  kind: { type: String },
  read: { type: Boolean, default: false },
  at: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
