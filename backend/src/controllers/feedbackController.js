import * as feedbackService from '../services/feedback/feedbackService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * POST /api/feedback
 * Body: { songUrl, songTitle, songArtist, rating, mood, comment }
 */
export async function createFeedback(req, res, next) {
    try {
        const feedback = await feedbackService.submitFeedback(req.user.uid, req.body);
        return successResponse(res, feedback, 'Geri bildirim kaydedildi', 201);
    } catch (error) {
        return next(error);
    }
}

/**
 * GET /api/feedback?limit=30&offset=0
 */
export async function getFeedbacks(req, res, next) {
    try {
        const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
        const offset = parseInt(req.query.offset, 10) || 0;
        const feedbacks = await feedbackService.getUserFeedbacks(req.user.uid, { limit, offset });
        return successResponse(res, feedbacks);
    } catch (error) {
        return next(error);
    }
}

/**
 * DELETE /api/feedback/:id
 */
export async function deleteFeedback(req, res, next) {
    try {
        const result = await feedbackService.removeFeedback(req.params.id, req.user.uid);
        if (!result) return errorResponse(res, 'Geri bildirim bulunamadı', 404);
        return successResponse(res, null, 'Geri bildirim silindi');
    } catch (error) {
        return next(error);
    }
}

export default { createFeedback, getFeedbacks, deleteFeedback };
