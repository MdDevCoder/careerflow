import mongoose, { Schema, Document } from 'mongoose';

export interface IInterview extends Document {
  application_id: mongoose.Types.ObjectId;
  round_type: string;
  scheduled_date: Date;
  notes?: string;
  interviewer_name?: string;
  interviewer_email?: string;
  interview_mode: 'Online' | 'Onsite' | 'Phone';
  status: 'Upcoming' | 'Completed' | 'Cancelled';
}

const InterviewSchema: Schema = new Schema({
  application_id: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
  round_type: { type: String, required: true },
  scheduled_date: { type: Date, required: true },
  notes: { type: String },
  interviewer_name: { type: String },
  interviewer_email: { type: String },
  interview_mode: { type: String, enum: ['Online', 'Onsite', 'Phone'], default: 'Online' },
  status: { type: String, enum: ['Upcoming', 'Completed', 'Cancelled'], default: 'Upcoming' }
});

InterviewSchema.index({ application_id: 1, scheduled_date: 1 });
InterviewSchema.index({ application_id: 1, status: 1, scheduled_date: 1 });

export default mongoose.model<IInterview>('Interview', InterviewSchema);
