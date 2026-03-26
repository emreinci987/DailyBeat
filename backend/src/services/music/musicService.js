import environment from '../../config/environment.js';
import logger from '../../utils/logger.js';

/**
 * Spotify & YouTube integration service.
 *
 * Spotify uses Client Credentials flow (server-to-server, no user auth).
 * YouTube uses a simple API key.
 */

let spotifyAccessToken = null;
let spotifyTokenExpiry = 0;

// ── Spotify helpers ──────────────────────────────────────────

async function getSpotifyToken() {
    if (spotifyAccessToken && Date.now() < spotifyTokenExpiry) {
        return spotifyAccessToken;
    }

    const { clientId, clientSecret } = environment.spotify;
    if (!clientId || !clientSecret) {
        logger.warn('Spotify credentials not configured');
        return null;
    }

    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
        body: 'grant_type=client_credentials',
    });

    if (!res.ok) {
        logger.error('Spotify token request failed', { status: res.status });
        return null;
    }

    const data = await res.json();
    spotifyAccessToken = data.access_token;
    spotifyTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return spotifyAccessToken;
}

export async function searchSpotifyTracks(query, limit = 10) {
    const token = await getSpotifyToken();
    if (!token) return [];

    const url = new URL('https://api.spotify.com/v1/search');
    url.searchParams.set('q', query);
    url.searchParams.set('type', 'track');
    url.searchParams.set('limit', String(limit));

    const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        logger.error('Spotify search failed', { status: res.status });
        return [];
    }

    const data = await res.json();
    return (data.tracks?.items || []).map(formatTrack);
}

/**
 * Get Spotify recommendations based on mood profile seed.
 *
 * Accepts the output of MoodProfile.toSpotifySeed() directly:
 *   {
 *     seed_genres: "pop,dance,happy",   // comma-separated string
 *     target_valence: 0.8,              // single number 0.0–1.0
 *     target_energy: 0.7,               // single number 0.0–1.0
 *   }
 *
 * @param {object} params
 * @param {string} params.seed_genres    - Comma-separated genre string (max 5)
 * @param {number} params.target_valence - Target valence 0.0–1.0
 * @param {number} params.target_energy  - Target energy 0.0–1.0
 * @param {number} [params.limit=10]     - Number of tracks to return
 */
export async function getSpotifyRecommendations({
    seed_genres,
    target_valence,
    target_energy,
    limit = 10,
}) {
    const token = await getSpotifyToken();
    if (!token) return [];

    const url = new URL('https://api.spotify.com/v1/recommendations');

    // seed_genres: moodMapping zaten string döndürüyor, max 5 genre al
    const genreList = seed_genres
        .split(',')
        .map((g) => g.trim())
        .slice(0, 5)
        .join(',');

    url.searchParams.set('seed_genres',    genreList);
    url.searchParams.set('target_valence', String(target_valence));
    url.searchParams.set('target_energy',  String(target_energy));
    url.searchParams.set('limit',          String(Math.min(limit, 100)));

    const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        // Fallback: IfRecommendations API is restricted (403/404), use Search API
        if (res.status === 403 || res.status === 404) {
            logger.info('Spotify recommendations endpoint restricted, falling back to search-based approach', { genreList });
            // Use the first 2 genres as search query for better precision
            const query = genreList.split(',').slice(0, 2).join(' ');
            return searchSpotifyTracks(query, limit);
        }
        logger.error('Spotify recommendations failed', { status: res.status, url: url.toString() });
        return [];
    }

    const data = await res.json();
    return (data.tracks || []).map(formatTrack);
}

// ── YouTube helpers ──────────────────────────────────────────

export async function searchYouTubeVideos(query, limit = 10) {
    const { apiKey } = environment.youtube;
    if (!apiKey) {
        logger.warn('YouTube API key not configured');
        return [];
    }

    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part',            'snippet');
    url.searchParams.set('type',            'video');
    url.searchParams.set('videoCategoryId', '10'); // Music
    url.searchParams.set('q',              query);
    url.searchParams.set('maxResults',     String(limit));
    url.searchParams.set('key',            apiKey);

    const res = await fetch(url.toString());

    if (!res.ok) {
        logger.error('YouTube search failed', { status: res.status });
        return [];
    }

    const data = await res.json();
    return (data.items || []).map((item) => ({
        title:        item.snippet.title,
        artist:       item.snippet.channelTitle,
        album:        null,
        url:          `https://www.youtube.com/watch?v=${item.id.videoId}`,
        thumbnailUrl: item.snippet.thumbnails?.high?.url || '',
        previewUrl:   null,
        source:       'youtube',
    }));
}

// ── Shared formatter ─────────────────────────────────────────

/**
 * Normalizes a raw Spotify track object into the app's SongRecommendation format.
 * @param {object} t - Raw Spotify track object
 */
function formatTrack(t) {
    return {
        title:        t.name,
        artist:       t.artists.map((a) => a.name).join(', '),
        album:        t.album.name,
        url:          t.external_urls.spotify,
        thumbnailUrl: t.album.images?.[0]?.url || '',
        previewUrl:   t.preview_url || '',
        source:       'spotify',
    };
}

export default { searchSpotifyTracks, getSpotifyRecommendations, searchYouTubeVideos };
