import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const generateToken = (userId: mongoose.Types.ObjectId | string): string => {
  return jwt.sign({ userId: userId.toString() }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

export default generateToken;
