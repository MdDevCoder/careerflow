import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../types';
import { ApplicationService } from '../services/ApplicationService';

export const getApplications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const applications = await ApplicationService.getApplications(String(req.user!._id), req.query);
  res.json(applications);
});

export const createApplication = asyncHandler(async (req: AuthRequest, res: Response) => {
  const application = await ApplicationService.createApplication(String(req.user!._id), req.body);
  res.status(201).json(application);
});

export const updateApplicationStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const application = await ApplicationService.updateApplicationStatus(String(req.user!._id), String(req.params.id), req.body.status);
  res.json(application);
});

export const updateApplication = asyncHandler(async (req: AuthRequest, res: Response) => {
  const application = await ApplicationService.updateApplication(String(req.user!._id), String(req.params.id), req.body);
  res.json(application);
});

export const deleteApplication = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await ApplicationService.deleteApplication(String(req.user!._id), String(req.params.id));
  res.json(result);
});

export const getApplicationActivities = asyncHandler(async (req: AuthRequest, res: Response) => {
  const activities = await ApplicationService.getApplicationActivities(String(req.user!._id), String(req.params.id));
  res.json(activities);
});
