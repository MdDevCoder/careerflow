import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password_hash: string;
  is_demo: boolean;
  created_at: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  is_demo: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', UserSchema);
