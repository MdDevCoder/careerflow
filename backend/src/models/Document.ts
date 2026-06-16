import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  user_id: mongoose.Types.ObjectId;
  name: string;
  type: 'Resume' | 'Cover Letter' | 'Portfolio';
  url: string;
  uploaded_at: Date;
}

const DocumentSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['Resume', 'Cover Letter', 'Portfolio'], required: true },
  url: { type: String, required: true },
  uploaded_at: { type: Date, default: Date.now }
});

DocumentSchema.index({ user_id: 1 });
DocumentSchema.index({ type: 1 });

export default mongoose.model<IDocument>('Document', DocumentSchema);
