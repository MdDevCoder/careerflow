import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import mongoose from 'mongoose';

const generateToken = (userId: mongoose.Types.ObjectId | string): string => {
  return jwt.sign({ userId: userId.toString() }, env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export default generateToken;
