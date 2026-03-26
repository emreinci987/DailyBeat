import * as recommendationService from '../services/recommendation/recommendationService.js';
import { successResponse } from '../utils/apiResponse.js';

/**
 * POST /api/recommendations
 * Body: { mood, limit?, save? }
 */
export async function getRecommendations(req, res, next) {
    try {
        const { mood, limit = 10, save = false } = req.body;
        const result = await recommendationService.getRecommendations(mood, {
            limit,
            save,
            userId: req.user.uid,
        });
        return successResponse(res, result, 'Öneriler oluşturuldu');
    } catch (error) {
        return next(error);
    }
}

/**
 * GET /api/recommendations/discover
 */
export async function getDiscovery(req, res, next) {
    try {
        const result = await recommendationService.getDiscovery(req.user.uid);
        return successResponse(res, result, 'Keşif önerileri');
    } catch (error) {
        return next(error);
    }
}

export default { getRecommendations, getDiscovery };
