import User from '../models/User.js';
import Playlist from '../models/Playlist.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * GET /api/users/profile
 */
export async function getProfile(req, res, next) {
    try {
        const user = await User.getUserById(req.user.uid);
        if (!user) return errorResponse(res, 'Kullanıcı bulunamadı', 404);
        return successResponse(res, user);
    } catch (error) {
        return next(error);
    }
}

/**
 * PUT /api/users/profile
 * Body: { displayName?, photoURL?, preferences? }
 */
export async function updateProfile(req, res, next) {
    try {
        const allowed = {};
        if (req.body.displayName !== undefined) allowed.displayName = req.body.displayName;
        if (req.body.photoURL !== undefined) allowed.photoURL = req.body.photoURL;
        if (req.body.preferences !== undefined) allowed.preferences = req.body.preferences;

        const user = await User.updateUser(req.user.uid, allowed);
        return successResponse(res, user, 'Profil güncellendi');
    } catch (error) {
        return next(error);
    }
}

/**
 * GET /api/users/playlists
 */
export async function getPlaylists(req, res, next) {
    try {
        const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
        const offset = parseInt(req.query.offset, 10) || 0;
        const playlists = await Playlist.getPlaylistsByUser(req.user.uid, { limit, offset });
        return successResponse(res, playlists);
    } catch (error) {
        return next(error);
    }
}

/**
 * DELETE /api/users/playlists/:id
 */
export async function deletePlaylist(req, res, next) {
    try {
        const playlist = await Playlist.getPlaylistById(req.params.id);
        if (!playlist) return errorResponse(res, 'Playlist bulunamadı', 404);
        if (playlist.userId !== req.user.uid) {
            return errorResponse(res, 'Bu playlist\'i silme yetkiniz yok', 403);
        }
        await Playlist.deletePlaylist(req.params.id);
        return successResponse(res, null, 'Playlist silindi');
    } catch (error) {
        return next(error);
    }
}

export default { getProfile, updateProfile, getPlaylists, deletePlaylist };
