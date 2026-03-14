import { Router } from 'express';
import { getProfile, updateProfile, getPlaylists, deletePlaylist } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { updateProfileSchema } from '../types/schemas.js';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), updateProfile);
router.get('/playlists', authenticate, getPlaylists);
router.delete('/playlists/:id', authenticate, deletePlaylist);

export default router;
