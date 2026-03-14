import { Router } from 'express';
import { searchMusic } from '../controllers/musicController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/search', optionalAuth, searchMusic);

export default router;
