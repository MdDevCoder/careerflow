import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../types';
import { AnalyticsService } from '../services/AnalyticsService';

// @desc    Get dashboard analytics
// @route   GET /api/analytics
// @access  Private
export const getAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const analytics = await AnalyticsService.getAnalytics(String(req.user!._id));
  res.json(analytics);
});
