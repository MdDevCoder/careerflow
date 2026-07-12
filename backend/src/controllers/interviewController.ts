import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../types';
import { InterviewService } from '../services/InterviewService';

export const getUpcomingInterviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const interviews = await InterviewService.getUpcomingInterviews(String(req.user!._id));
  res.json(interviews);
});

export const getApplicationInterviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const interviews = await InterviewService.getApplicationInterviews(String(req.user!._id), String(req.params.id));
  res.json(interviews);
});

export const createInterview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const interview = await InterviewService.createInterview(String(req.user!._id), String(req.params.id), req.body);
  res.status(201).json(interview);
});

export const updateInterview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const interview = await InterviewService.updateInterview(String(req.user!._id), String(req.params.id), String(req.params.interviewId), req.body);
  res.json(interview);
});
