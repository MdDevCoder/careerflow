import { Router } from 'express';
import { getUpcomingInterviews } from '../controllers/interviewController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/upcoming', protect, getUpcomingInterviews);

export default router;
