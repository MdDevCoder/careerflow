import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  user_id: mongoose.Types.ObjectId;
  company_name: string;
  company_logo?: string;
  job_title: string;
  status: 'Wishlist' | 'Applied' | 'Assessment' | 'Interview' | 'Offer' | 'Rejected' | 'Accepted';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  source?: 'LinkedIn' | 'Indeed' | 'Naukri' | 'Referral' | 'Website';
  health_score: 'HEALTHY' | 'AT_RISK' | 'STALE' | 'SUCCESS';
  location?: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  job_url?: string;
  application_notes?: string;
  contact_person?: string;
  contact_email?: string;
  applied_date?: Date;
  created_at: Date;
  updated_at: Date;
}

const ApplicationSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  company_name: { type: String, required: true },
  company_logo: { type: String },
  job_title: { type: String, required: true },
  status: { type: String, enum: ['Wishlist', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Accepted'], default: 'Wishlist' },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
  source: { type: String, enum: ['LinkedIn', 'Indeed', 'Naukri', 'Referral', 'Website'] },
  health_score: { type: String, enum: ['HEALTHY', 'AT_RISK', 'STALE', 'SUCCESS'], default: 'HEALTHY' },
  location: { type: String },
  salary_min: { type: Number },
  salary_max: { type: Number },
  currency: { type: String },
  job_url: { type: String },
  application_notes: { type: String },
  contact_person: { type: String },
  contact_email: { type: String },
  applied_date: { type: Date }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Compound index to support getApplications with pagination and default sort
ApplicationSchema.index({ user_id: 1, applied_date: -1, created_at: -1 });
// Compound index for AnalyticsService which groups by status per user
ApplicationSchema.index({ user_id: 1, status: 1 });
ApplicationSchema.index({ user_id: 1, source: 1 });

export default mongoose.model<IApplication>('Application', ApplicationSchema);
