import { Router } from 'express';
import { createFeedback, getFeedbacks, deleteFeedback } from '../controllers/feedbackController.js';
import { authenticate } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { feedbackSchema } from '../types/schemas.js';

const router = Router();

router.post('/', authenticate, validate(feedbackSchema), createFeedback);
router.get('/', authenticate, getFeedbacks);
router.delete('/:id', authenticate, deleteFeedback);

export default router;
