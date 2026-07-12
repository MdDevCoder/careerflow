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
import { validateRequest } from '../middleware/validateRequest';
import { 
  createApplicationSchema, 
  updateApplicationSchema, 
  updateApplicationStatusSchema 
} from '../validators/application.validator';
import { 
  createInterviewSchema, 
  updateInterviewSchema 
} from '../validators/interview.validator';

const router = Router();

router.route('/')
  .get(protect, getApplications)
  .post(protect, validateRequest(createApplicationSchema), createApplication);

router.route('/:id/status')
  .patch(protect, validateRequest(updateApplicationStatusSchema), updateApplicationStatus);

router.route('/:id')
  .put(protect, validateRequest(updateApplicationSchema), updateApplication)
  .delete(protect, deleteApplication);

// Activity log routes nested
router.get('/:id/activities', protect, getApplicationActivities);

// Interview routes nested
router.get('/:id/interviews', protect, getApplicationInterviews);
router.post('/:id/interviews', protect, validateRequest(createInterviewSchema), createInterview);
router.put('/:id/interviews/:interviewId', protect, validateRequest(updateInterviewSchema), updateInterview);

export default router;
