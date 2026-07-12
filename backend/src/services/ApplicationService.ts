import Application from '../models/Application';
import ActivityLog from '../models/ActivityLog';

export class ApplicationService {
  static async getApplications(userId: string, queryParams: any) {
    const query: any = { user_id: userId };
    
    if (queryParams.status) query.status = queryParams.status;
    if (queryParams.priority) query.priority = queryParams.priority;
    if (queryParams.source) query.source = queryParams.source;
    if (queryParams.health_score) query.health_score = queryParams.health_score;

    const page = parseInt(String(queryParams.page || '1')) || 1;
    const limit = parseInt(String(queryParams.limit || '100')) || 100;
    const skip = (page - 1) * limit;

    return Application.find(query)
      .sort({ applied_date: -1, created_at: -1 })
      .skip(skip)
      .limit(limit);
  }

  static async createApplication(userId: string, body: any) {
    const application = new Application({
      ...body,
      user_id: userId,
    });

    const createdApplication = await application.save();

    await ActivityLog.create({
      application_id: String(createdApplication._id),
      event_type: 'Application Created',
      description: `Created application for ${createdApplication.company_name} - ${createdApplication.job_title}`,
    });

    return createdApplication;
  }

  static async updateApplicationStatus(userId: string, applicationId: string, status: string) {
    const application = await Application.findOne({ _id: applicationId, user_id: userId });

    if (!application) {
      const error = new Error('Application not found');
      (error as any).status = 404;
      throw error;
    }

    const oldStatus = application.status;
    application.status = status as any;
    
    if (status === 'Accepted') application.health_score = 'SUCCESS';
    
    const updatedApplication = await application.save();

    if (oldStatus !== status) {
      await ActivityLog.create({
        application_id: String(updatedApplication._id),
        event_type: 'Status Changed',
        description: `Moved from ${oldStatus} to ${status}`,
      });
    }

    return updatedApplication;
  }

  static async updateApplication(userId: string, applicationId: string, body: any) {
    const application = await Application.findOne({ _id: applicationId, user_id: userId });

    if (!application) {
      const error = new Error('Application not found');
      (error as any).status = 404;
      throw error;
    }

    const oldPriority = application.priority;
    const oldStatus = application.status;

    Object.assign(application, body);
    const updatedApplication = await application.save();

    if (body.status && body.status !== oldStatus) {
      await ActivityLog.create({
        application_id: String(updatedApplication._id),
        event_type: 'Status Changed',
        description: `Moved from ${oldStatus} to ${body.status}`,
      });
    } else if (body.priority && body.priority !== oldPriority) {
      await ActivityLog.create({
        application_id: String(updatedApplication._id),
        event_type: 'Priority Changed',
        description: `Priority updated from ${oldPriority} to ${body.priority}`,
      });
    } else {
      await ActivityLog.create({
        application_id: String(updatedApplication._id),
        event_type: 'Application Updated',
        description: `Application details were updated`,
      });
    }

    return updatedApplication;
  }

  static async deleteApplication(userId: string, applicationId: string) {
    const application = await Application.findOne({ _id: applicationId, user_id: userId });

    if (!application) {
      const error = new Error('Application not found');
      (error as any).status = 404;
      throw error;
    }

    await application.deleteOne();
    await ActivityLog.deleteMany({ application_id: applicationId });
    
    return { message: 'Application removed' };
  }

  static async getApplicationActivities(userId: string, applicationId: string) {
    const application = await Application.findOne({ _id: applicationId, user_id: userId });

    if (!application) {
      const error = new Error('Application not found');
      (error as any).status = 404;
      throw error;
    }

    return ActivityLog.find({ application_id: applicationId }).sort({ created_at: -1 });
  }
}
