import { Router } from 'express';
import { 
  getApplications, 
  createApplication, 
  updateApplicationStatus, 
  updateApplication,
  deleteApplication,
  getApplicationActivities
} from '../controllers/applicationController';
import {
  getApplicationInterviews,
  createInterview,
  updateInterview
} from '../controllers/interviewController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.route('/')
  .get(protect, getApplications)
  .post(protect, createApplication);

router.route('/:id/status')
  .patch(protect, updateApplicationStatus);

router.route('/:id')
  .put(protect, updateApplication)
  .delete(protect, deleteApplication);

// Activity log routes nested
router.get('/:id/activities', protect, getApplicationActivities);

// Interview routes nested
router.get('/:id/interviews', protect, getApplicationInterviews);
router.post('/:id/interviews', protect, createInterview);
router.put('/:id/interviews/:interviewId', protect, updateInterview);

export default router;
