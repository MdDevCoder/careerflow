import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  application_id: mongoose.Types.ObjectId;
  event_type: 'Application Created' | 'Status Changed' | 'Priority Changed' | 'Application Updated' | 'Interview Scheduled' | 'Interview Rescheduled' | 'Interview Completed' | 'Interview Cancelled' | 'Offer Received' | 'Application Rejected' | 'Application Accepted';
  description: string;
  created_at: Date;
}

const ActivityLogSchema: Schema = new Schema({
  application_id: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
  event_type: {
      type: String,
      required: true,
      enum: [
        'Application Created',
        'Status Changed',
        'Priority Changed',
        'Application Updated',
        'Interview Scheduled',
        'Interview Rescheduled',
        'Interview Completed',
        'Interview Cancelled',
        'Offer Received',
        'Application Rejected',
        'Application Accepted'
      ],
    },
  description: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

ActivityLogSchema.index({ application_id: 1, created_at: -1 });

export default mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
