import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Interview from '../models/Interview';
import Application from '../models/Application';
import ActivityLog from '../models/ActivityLog';

// @desc    Get all upcoming interviews for user (Smart Reminders)
// @route   GET /api/interviews/upcoming
// @access  Private
export const getUpcomingInterviews = asyncHandler(async (req: any, res: Response) => {
  // We need to join with Application to ensure user ownership and get company details
  const applications = await Application.find({ user_id: req.user._id }).select('_id company_name job_title');
  const appIds = applications.map(app => app._id);

  const interviews = await Interview.find({
    application_id: { $in: appIds },
    status: 'Upcoming'
  }).sort({ scheduled_date: 1 });

  // Attach company info for the frontend reminder cards
  const enriched = interviews.map(int => {
    const app = applications.find(a => a._id.toString() === int.application_id.toString());
    return {
      ...int.toObject(),
      company_name: app?.company_name,
      job_title: app?.job_title
    };
  });

  res.json(enriched);
});

// @desc    Get interviews for a specific application
// @route   GET /api/applications/:id/interviews
// @access  Private
export const getApplicationInterviews = asyncHandler(async (req: any, res: Response) => {
  const application = await Application.findOne({ _id: req.params.id, user_id: req.user._id });
  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  const interviews = await Interview.find({ application_id: req.params.id }).sort({ scheduled_date: 1 });
  res.json(interviews);
});

// @desc    Create interview
// @route   POST /api/applications/:id/interviews
// @access  Private
export const createInterview = asyncHandler(async (req: any, res: Response) => {
  const application = await Application.findOne({ _id: req.params.id, user_id: req.user._id });
  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  const interview = await Interview.create({
    ...req.body,
    application_id: req.params.id
  });

  await ActivityLog.create({
    application_id: req.params.id,
    event_type: 'Interview Scheduled',
    description: `${req.body.round_type} scheduled for ${new Date(req.body.scheduled_date).toLocaleDateString()}`
  });

  // Update application health score automatically
  application.health_score = 'AT_RISK'; // "Upcoming Interview -> AT_RISK" per phase 1 rules
  await application.save();

  res.status(201).json(interview);
});

// @desc    Update interview
// @route   PUT /api/applications/:id/interviews/:interviewId
// @access  Private
export const updateInterview = asyncHandler(async (req: any, res: Response) => {
  const application = await Application.findOne({ _id: req.params.id, user_id: req.user._id });
  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  const interview = await Interview.findOne({ _id: req.params.interviewId, application_id: req.params.id });
  if (!interview) {
    res.status(404);
    throw new Error('Interview not found');
  }

  const oldStatus = interview.status;
  const oldDate = new Date(interview.scheduled_date).getTime();

  Object.assign(interview, req.body);
  const updatedInterview = await interview.save();

  // Generate Activity
  if (req.body.status && req.body.status !== oldStatus) {
    if (req.body.status === 'Completed') {
      await ActivityLog.create({
        application_id: req.params.id,
        event_type: 'Interview Completed',
        description: `${interview.round_type} was marked as completed`
      });
      application.health_score = 'HEALTHY';
      await application.save();
    } else if (req.body.status === 'Cancelled') {
      await ActivityLog.create({
        application_id: req.params.id,
        event_type: 'Interview Cancelled',
        description: `${interview.round_type} was cancelled`
      });
    }
  } else if (req.body.scheduled_date && new Date(req.body.scheduled_date).getTime() !== oldDate) {
    await ActivityLog.create({
      application_id: req.params.id,
      event_type: 'Interview Rescheduled',
      description: `${interview.round_type} rescheduled to ${new Date(req.body.scheduled_date).toLocaleDateString()}`
    });
  }

  res.json(updatedInterview);
});
