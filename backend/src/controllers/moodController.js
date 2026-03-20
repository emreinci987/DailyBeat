import * as moodService from '../services/mood/moodService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { availableMoods } from '../utils/moodMapping.js';
import { HistoryFormatter } from '../utils/historyFormatter.js';

/**
 * POST /api/mood
 * Body: { mood, intensity, note }
 */
export async function createMood(req, res, next) {
    try {
        const entry = await moodService.recordMood(req.user.uid, req.body);
        return successResponse(res, entry, 'Ruh hali kaydedildi', 201);
    } catch (error) {
        return next(error);
    }
}

/**
 * GET /api/mood/history?limit=30&offset=0
 */
export async function getHistory(req, res, next) {
    try {
        const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
        const offset = parseInt(req.query.offset, 10) || 0;
        const entries = await moodService.getUserMoodHistory(req.user.uid, { limit, offset });

        // Format data using the new formatter
        const formattedData = HistoryFormatter.formatMoodHistory(entries);

        // The paginatedResponse might not be suitable anymore if we send a complex object.
        // Let's use successResponse for now.
        return successResponse(res, formattedData);
    } catch (error) {
        return next(error);
    }
}

/**
 * GET /api/mood/stats
 */
export async function getStats(req, res, next) {
    try {
        const stats = await moodService.getUserMoodStats(req.user.uid);
        return successResponse(res, stats);
    } catch (error) {
        return next(error);
    }
}

/**
 * DELETE /api/mood/:id
 */
export async function deleteMood(req, res, next) {
    try {
        const result = await moodService.removeMoodEntry(req.params.id, req.user.uid);
        if (!result) return errorResponse(res, 'Kayıt bulunamadı', 404);
        return successResponse(res, null, 'Kayıt silindi');
    } catch (error) {
        return next(error);
    }
}

/**
 * GET /api/mood/types
 */
export function getMoodTypes(_req, res) {
    return successResponse(res, availableMoods, 'Mevcut ruh halleri');
}

export default { createMood, getHistory, getStats, deleteMood, getMoodTypes };
