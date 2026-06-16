import { Router } from 'express';
import { registerUser, loginUser, demoLogin } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/demo', demoLogin);

// Example of a protected route to get current user info
router.get('/me', protect, (req: any, res) => {
  res.json({
    _id: req.user._id,
    email: req.user.email,
  });
});

export default router;
