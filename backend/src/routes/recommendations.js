import { Router } from 'express';
import { getRecommendations, getDiscovery } from '../controllers/recommendationController.js';
import { authenticate } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { recommendationSchema } from '../types/schemas.js';

const router = Router();

router.post('/', authenticate, validate(recommendationSchema), getRecommendations);
router.get('/discover', authenticate, getDiscovery);

export default router;
