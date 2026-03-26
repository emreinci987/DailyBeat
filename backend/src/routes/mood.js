import { Router } from 'express';
import { createMood, getHistory, getStats, deleteMood, getMoodTypes } from '../controllers/moodController.js';
import { authenticate } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { moodSchema } from '../types/schemas.js';

const router = Router();

router.get('/types', getMoodTypes); // public
router.post('/', authenticate, validate(moodSchema), createMood);
router.get('/history', authenticate, getHistory);
router.get('/stats', authenticate, getStats);
router.delete('/:id', authenticate, deleteMood);

export default router;
