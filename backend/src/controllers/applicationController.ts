import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Application from '../models/Application';
import ActivityLog from '../models/ActivityLog';

// @desc    Get all applications for logged in user
// @route   GET /api/applications
// @access  Private
export const getApplications = asyncHandler(async (req: any, res: Response) => {
  const query: any = { user_id: req.user._id };
  
  if (req.query.status) query.status = req.query.status;
  if (req.query.priority) query.priority = req.query.priority;
  if (req.query.source) query.source = req.query.source;
  if (req.query.health_score) query.health_score = req.query.health_score;

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 100;
  const skip = (page - 1) * limit;

  const applications = await Application.find(query)
    .sort({ applied_date: -1, created_at: -1 })
    .skip(skip)
    .limit(limit);
    
  res.json(applications);
});

// @desc    Create new application
// @route   POST /api/applications
// @access  Private
export const createApplication = asyncHandler(async (req: any, res: Response) => {
  const application = new Application({
    ...req.body,
    user_id: req.user._id,
  });

  const createdApplication = await application.save();

  await ActivityLog.create({
    application_id: createdApplication._id,
    event_type: 'Application Created',
    description: `Created application for ${createdApplication.company_name} - ${createdApplication.job_title}`,
  });

  res.status(201).json(createdApplication);
});

// @desc    Update application status (Optimized for drag-and-drop)
// @route   PATCH /api/applications/:id/status
// @access  Private
export const updateApplicationStatus = asyncHandler(async (req: any, res: Response) => {
  const { status } = req.body;
  const application = await Application.findOne({ _id: req.params.id, user_id: req.user._id });

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  const oldStatus = application.status;
  application.status = status;
  
  // Health score logic can go here (simplified)
  if (status === 'Accepted') application.health_score = 'SUCCESS';
  
  const updatedApplication = await application.save();

  if (oldStatus !== status) {
    await ActivityLog.create({
      application_id: updatedApplication._id,
      event_type: 'Status Changed',
      description: `Moved from ${oldStatus} to ${status}`,
    });
  }

  res.json(updatedApplication);
});

// @desc    Update application
// @route   PUT /api/applications/:id
// @access  Private
export const updateApplication = asyncHandler(async (req: any, res: Response) => {
  const application = await Application.findOne({ _id: req.params.id, user_id: req.user._id });

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  const oldPriority = application.priority;
  const oldStatus = application.status;

  Object.assign(application, req.body);
  const updatedApplication = await application.save();

  // Automatic Activity Generation
  if (req.body.status && req.body.status !== oldStatus) {
    await ActivityLog.create({
      application_id: updatedApplication._id,
      event_type: 'Status Changed',
      description: `Moved from ${oldStatus} to ${req.body.status}`,
    });
  } else if (req.body.priority && req.body.priority !== oldPriority) {
    await ActivityLog.create({
      application_id: updatedApplication._id,
      event_type: 'Priority Changed',
      description: `Priority updated from ${oldPriority} to ${req.body.priority}`,
    });
  } else {
    // Generic update
    await ActivityLog.create({
      application_id: updatedApplication._id,
      event_type: 'Application Updated',
      description: `Application details were updated`,
    });
  }

  res.json(updatedApplication);
});

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private
export const deleteApplication = asyncHandler(async (req: any, res: Response) => {
  const application = await Application.findOne({ _id: req.params.id, user_id: req.user._id });

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  await application.deleteOne();
  // Also clean up activity logs and interviews related to this application
  await ActivityLog.deleteMany({ application_id: req.params.id });
  
  res.json({ message: 'Application removed' });
});

// @desc    Get application activities
// @route   GET /api/applications/:id/activities
// @access  Private
export const getApplicationActivities = asyncHandler(async (req: any, res: Response) => {
  const application = await Application.findOne({ _id: req.params.id, user_id: req.user._id });

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  const activities = await ActivityLog.find({ application_id: req.params.id }).sort({ created_at: -1 });
  res.json(activities);
});
