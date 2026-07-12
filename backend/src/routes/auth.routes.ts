import { Router } from 'express';
import { registerUser, loginUser, demoLogin } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { loginSchema, registerSchema } from '../validators/auth.validator';
import rateLimit from 'express-rate-limit';
import { AuthRequest } from '../types';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
});

router.post('/register', authLimiter, validateRequest(registerSchema), registerUser);
router.post('/login', authLimiter, validateRequest(loginSchema), loginUser);
router.post('/demo', authLimiter, demoLogin);

// Example of a protected route to get current user info
router.get('/me', protect, (req: AuthRequest, res) => {
  res.json({
    _id: req.user!._id,
    email: req.user!.email,
  });
});

export default router;
