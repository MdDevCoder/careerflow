import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthService } from '../services/AuthService';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.body.email || !req.body.password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const result = await AuthService.registerUser(req.body);
  res.status(201).json(result);
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);
  res.json(result);
});

// @desc    Create demo account and seed data
// @route   POST /api/auth/demo
// @access  Public
export const demoLogin = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.demoLogin();
  res.status(201).json(result);
});
