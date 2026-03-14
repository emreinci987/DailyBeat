import { Router } from 'express';
import { register, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { registerSchema } from '../types/schemas.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.get('/me', authenticate, getMe);

export default router;
