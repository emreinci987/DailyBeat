import { getMoodMapping } from '../../utils/moodMapping.js';
import { getSpotifyRecommendations, searchYouTubeVideos } from '../music/musicService.js';
import Playlist from '../../models/Playlist.js';
import logger from '../../utils/logger.js';

/**
 * Generate music recommendations based on mood,
 * and optionally persist as a playlist.
 */

export async function getRecommendations(mood, { limit = 10, save = false, userId = null } = {}) {
    const mapping = getMoodMapping(mood);
    let songs = [];

    // Try Spotify first
    try {
        songs = await getSpotifyRecommendations({
            genres: mapping.genres,
            valence: mapping.valence,
            energy: mapping.energy,
            limit,
        });
    } catch (err) {
        logger.warn('Spotify recommendations failed, falling back to YouTube', { error: err.message });
    }

    // Fallback / supplement with YouTube
    if (songs.length < limit) {
        try {
            const keyword = mapping.keywords[Math.floor(Math.random() * mapping.keywords.length)];
            const ytResults = await searchYouTubeVideos(`${keyword} music`, limit - songs.length);
            songs = [...songs, ...ytResults];
        } catch (err) {
            logger.warn('YouTube search also failed', { error: err.message });
        }
    }

    // Optionally save as a playlist
    let playlist = null;
    if (save && userId && songs.length > 0) {
        playlist = await Playlist.createPlaylist({ userId, mood, songs });
    }

    return { songs, playlist };
}

/**
 * "Discovery mode" – returns a random selection from an unexpected genre.
 */
export async function getDiscovery(userId) {
    const surpriseGenres = ['jazz', 'classical', 'world-music', 'blues', 'reggae', 'latin', 'k-pop'];
    const genre = surpriseGenres[Math.floor(Math.random() * surpriseGenres.length)];

    try {
        const songs = await searchYouTubeVideos(`${genre} music discover`, 5);
        return { genre, songs };
    } catch (err) {
        logger.error('Discovery mode failed', { error: err.message });
        return { genre, songs: [] };
    }
}

export default { getRecommendations, getDiscovery };
