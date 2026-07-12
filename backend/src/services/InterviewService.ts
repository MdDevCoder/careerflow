import Interview from '../models/Interview';
import Application from '../models/Application';
import ActivityLog from '../models/ActivityLog';

export class InterviewService {
  static async getUpcomingInterviews(userId: string) {
    const applications = await Application.find({ user_id: userId }).select('_id company_name job_title');
    const appIds = applications.map(app => app._id);

    const interviews = await Interview.find({
      application_id: { $in: appIds },
      status: 'Upcoming'
    }).sort({ scheduled_date: 1 });

    return interviews.map(int => {
      const app = applications.find(a => String(a._id) === String(int.application_id));
      return {
        ...int.toObject(),
        company_name: app?.company_name,
        job_title: app?.job_title
      };
    });
  }

  static async getApplicationInterviews(userId: string, applicationId: string) {
    const application = await Application.findOne({ _id: applicationId, user_id: userId });
    if (!application) {
      const error = new Error('Application not found');
      (error as any).status = 404;
      throw error;
    }

    return Interview.find({ application_id: applicationId }).sort({ scheduled_date: 1 });
  }

  static async createInterview(userId: string, applicationId: string, body: any) {
    const application = await Application.findOne({ _id: applicationId, user_id: userId });
    if (!application) {
      const error = new Error('Application not found');
      (error as any).status = 404;
      throw error;
    }

    const interview = await Interview.create({
      ...body,
      application_id: applicationId
    });

    await ActivityLog.create({
      application_id: applicationId,
      event_type: 'Interview Scheduled',
      description: `${body.round_type} scheduled for ${new Date(body.scheduled_date).toLocaleDateString()}`
    });

    application.health_score = 'AT_RISK';
    await application.save();

    return interview;
  }

  static async updateInterview(userId: string, applicationId: string, interviewId: string, body: any) {
    const application = await Application.findOne({ _id: applicationId, user_id: userId });
    if (!application) {
      const error = new Error('Application not found');
      (error as any).status = 404;
      throw error;
    }

    const interview = await Interview.findOne({ _id: interviewId, application_id: applicationId });
    if (!interview) {
      const error = new Error('Interview not found');
      (error as any).status = 404;
      throw error;
    }

    const oldStatus = interview.status;
    const oldDate = new Date(interview.scheduled_date).getTime();

    Object.assign(interview, body);
    const updatedInterview = await interview.save();

    if (body.status && body.status !== oldStatus) {
      if (body.status === 'Completed') {
        await ActivityLog.create({
          application_id: applicationId,
          event_type: 'Interview Completed',
          description: `${interview.round_type} was marked as completed`
        });
        application.health_score = 'HEALTHY';
        await application.save();
      } else if (body.status === 'Cancelled') {
        await ActivityLog.create({
          application_id: applicationId,
          event_type: 'Interview Cancelled',
          description: `${interview.round_type} was cancelled`
        });
      }
    } else if (body.scheduled_date && new Date(body.scheduled_date).getTime() !== oldDate) {
      await ActivityLog.create({
        application_id: applicationId,
        event_type: 'Interview Rescheduled',
        description: `${interview.round_type} rescheduled to ${new Date(body.scheduled_date).toLocaleDateString()}`
      });
    }

    return updatedInterview;
  }
}
