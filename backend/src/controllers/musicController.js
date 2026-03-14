import { searchSpotifyTracks, searchYouTubeVideos } from '../services/music/musicService.js';
import { successResponse } from '../utils/apiResponse.js';

/**
 * GET /api/music/search?q=...&source=spotify|youtube&limit=10
 */
export async function searchMusic(req, res, next) {
    try {
        const { q, source = 'spotify', limit = '10' } = req.query;
        const parsedLimit = Math.min(parseInt(limit, 10) || 10, 50);

        let results;
        if (source === 'youtube') {
            results = await searchYouTubeVideos(q, parsedLimit);
        } else {
            results = await searchSpotifyTracks(q, parsedLimit);
        }

        return successResponse(res, results, `${results.length} sonuç bulundu`);
    } catch (error) {
        return next(error);
    }
}

export default { searchMusic };
