import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Application from '../models/Application';
import Interview from '../models/Interview';
import mongoose from 'mongoose';

// @desc    Get dashboard analytics
// @route   GET /api/analytics
// @access  Private
export const getAnalytics = asyncHandler(async (req: any, res: Response) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);

  // 1. Funnel Pipeline
  const funnelRaw = await Application.aggregate([
    { $match: { user_id: userId } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  const funnelMap: Record<string, number> = {};
  funnelRaw.forEach(f => funnelMap[f._id] = f.count);

  const funnel = [
    { stage: 'Wishlist', value: funnelMap['Wishlist'] || 0 },
    { stage: 'Applied', value: funnelMap['Applied'] || 0 },
    { stage: 'Assessment', value: funnelMap['Assessment'] || 0 },
    { stage: 'Interview', value: funnelMap['Interview'] || 0 },
    { stage: 'Offer', value: funnelMap['Offer'] || 0 },
    { stage: 'Accepted', value: funnelMap['Accepted'] || 0 },
  ];

  // 2. Source Analytics
  const sourcesRaw = await Application.aggregate([
    { $match: { user_id: userId } },
    {
      $group: {
        _id: '$source',
        total: { $sum: 1 },
        interviews: { $sum: { $cond: [{ $in: ['$status', ['Interview', 'Offer', 'Accepted']] }, 1, 0] } },
        offers: { $sum: { $cond: [{ $in: ['$status', ['Offer', 'Accepted']] }, 1, 0] } }
      }
    },
    { $sort: { total: -1 } }
  ]);

  // 3. Monthly Trends
  const monthlyRaw = await Application.aggregate([
    { $match: { user_id: userId, applied_date: { $exists: true } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$applied_date' } },
        applications: { $sum: 1 },
        interviews: { $sum: { $cond: [{ $in: ['$status', ['Interview', 'Offer', 'Accepted']] }, 1, 0] } },
        offers: { $sum: { $cond: [{ $in: ['$status', ['Offer', 'Accepted']] }, 1, 0] } }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  // 4. Priority Analysis
  const priorityRaw = await Application.aggregate([
    { $match: { user_id: userId } },
    {
      $group: {
        _id: '$priority',
        total: { $sum: 1 },
        interviews: { $sum: { $cond: [{ $in: ['$status', ['Interview', 'Offer', 'Accepted']] }, 1, 0] } },
        offers: { $sum: { $cond: [{ $in: ['$status', ['Offer', 'Accepted']] }, 1, 0] } }
      }
    }
  ]);

  // 5. Health Score
  const healthRaw = await Application.aggregate([
    { $match: { user_id: userId } },
    { $group: { _id: '$health_score', count: { $sum: 1 } } }
  ]);

  // 6. KPIs
  const totalApplications = funnelRaw.reduce((acc, curr) => acc + curr.count, 0);
  const activeApplications = totalApplications - (funnelMap['Rejected'] || 0) - (funnelMap['Accepted'] || 0);
  const totalInterviews = (funnelMap['Interview'] || 0) + (funnelMap['Offer'] || 0) + (funnelMap['Accepted'] || 0);
  const totalOffers = (funnelMap['Offer'] || 0) + (funnelMap['Accepted'] || 0);
  const successRate = totalApplications > 0 ? (totalOffers / totalApplications) * 100 : 0;
  const interviewRate = totalApplications > 0 ? (totalInterviews / totalApplications) * 100 : 0;

  // Interview Collection Metrics
  const interviewDocs = await Interview.aggregate([
    { $lookup: { from: 'applications', localField: 'application_id', foreignField: '_id', as: 'app' } },
    { $match: { 'app.user_id': userId } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  const interviewsScheduled = interviewDocs.reduce((acc, curr) => acc + curr.count, 0);
  const interviewsCompleted = interviewDocs.find(i => i._id === 'Completed')?.count || 0;

  // 7. Insight Engine
  const insights: string[] = [];
  
  if (totalApplications < 5) {
    insights.push("You are just getting started! Try adding more applications to see deeper insights.");
  }

  // Source Insights
  if (sourcesRaw.length > 0) {
    const bestSource = sourcesRaw.reduce((prev, curr) => {
      const prevRate = prev.total > 0 ? prev.interviews / prev.total : 0;
      const currRate = curr.total > 0 ? curr.interviews / curr.total : 0;
      return currRate > prevRate ? curr : prev;
    }, sourcesRaw[0]);

    if (bestSource.interviews > 0) {
      const rate = Math.round((bestSource.interviews / bestSource.total) * 100);
      insights.push(`Your highest conversion source is ${bestSource._id} with a ${rate}% interview rate.`);
    }
  }

  // Health Insights
  const staleCount = healthRaw.find(h => h._id === 'STALE')?.count || 0;
  if (staleCount > 0) {
    insights.push(`You have not updated ${staleCount} applications in over 30 days.`);
  }

  // Priority Insights
  const highPriority = priorityRaw.find(p => p._id === 'HIGH');
  if (highPriority && highPriority.total > 0) {
    const rate = Math.round((highPriority.interviews / highPriority.total) * 100);
    insights.push(`High priority applications convert to interviews at a rate of ${rate}%.`);
  }

  if (totalOffers > 0) {
    insights.push(`Congratulations on receiving ${totalOffers} offer(s)! You have a ${successRate.toFixed(1)}% success rate.`);
  }

  res.json({
    kpis: {
      totalApplications,
      activeApplications,
      interviewsScheduled,
      interviewsCompleted,
      offersReceived: totalOffers,
      applicationsRejected: funnelMap['Rejected'] || 0,
      successRate: Math.round(successRate),
      interviewConversionRate: Math.round(interviewRate)
    },
    funnel,
    sources: sourcesRaw.map(s => ({ source: s._id, ...s })),
    monthly: monthlyRaw.map(m => ({ month: m._id, ...m })),
    priority: priorityRaw.map(p => ({ priority: p._id, ...p })),
    health: healthRaw.map(h => ({ name: h._id, value: h.count })),
    insights
  });
});
