import { Router } from 'express';
import { register, login, getMe, forgotPassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { registerSchema, loginSchema, forgotPasswordSchema } from '../types/schemas.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.get('/me', authenticate, getMe);

export default router;
