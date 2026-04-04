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
let youtubeQuotaBlockedUntil = 0;
let youtubeQuotaLogShown = false;
const SPOTIFY_SEARCH_MAX_LIMIT = 10;

const spotifyGenreSearchAliases = {
    'r-n-b': 'rnb',
    'new-age': 'new age',
    'k-pop': 'kpop',
    'singer-songwriter': 'singer songwriter',
};

function toSpotifySearchGenre(genre) {
    const normalized = String(genre || '').trim().toLowerCase();
    return spotifyGenreSearchAliases[normalized] || normalized;
}

function sanitizeSpotifyQuery(query) {
    return String(query || '')
        .replace(/[^\p{L}\p{N}\s:"-]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

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

    const normalizedQuery = sanitizeSpotifyQuery(query);
    if (!normalizedQuery) {
        logger.warn('Spotify search skipped due to empty query');
        return [];
    }

    const url = new URL('https://api.spotify.com/v1/search');
    const requestedLimit = Number(limit) || 10;
    const effectiveLimit = Math.min(Math.max(requestedLimit, 1), SPOTIFY_SEARCH_MAX_LIMIT);
    url.searchParams.set('q', normalizedQuery);
    url.searchParams.set('type', 'track');
    url.searchParams.set('limit', String(effectiveLimit));
    url.searchParams.set('market', 'TR');

    const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        let errorBody = '';
        try {
            errorBody = await res.text();
        } catch {
            errorBody = '';
        }
        logger.error('Spotify search failed', {
            status: res.status,
            query: normalizedQuery,
            requestedLimit,
            effectiveLimit,
            errorBody: errorBody.slice(0, 240),
        });
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

    // seed_genres: moodMapping'den gelen değer, güvenli şekilde normalize edilir.
    const genreList = seed_genres
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean)
        .slice(0, 5)
        .join(',');

    if (!genreList) {
        logger.warn('Spotify recommendations skipped due to empty seed genres');
        return searchSpotifyTracks('top hits', limit);
    }

    url.searchParams.set('seed_genres',    genreList);
    url.searchParams.set('target_valence', String(target_valence));
    url.searchParams.set('target_energy',  String(target_energy));
    url.searchParams.set('limit',          String(Math.min(limit, 100)));
    url.searchParams.set('market',         'TR');

    const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        // Fallback: If recommendations API is unavailable/invalid, use Search API.
        // 400 typically means unsupported seed genres or invalid params.
        if (res.status === 400 || res.status === 403 || res.status === 404) {
            logger.info('Spotify recommendations endpoint restricted, falling back to search-based approach', { genreList });
            // Use safe and Spotify-compatible broad search terms.
            const queryGenres = genreList
                .split(',')
                .slice(0, 2)
                .map((genre) => toSpotifySearchGenre(genre))
                .join(' ')
                .trim();
            const query = `${queryGenres} popular tracks`.trim();
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
    if (Date.now() < youtubeQuotaBlockedUntil) {
        if (!youtubeQuotaLogShown) {
            logger.warn('YouTube API temporarily paused due to quota/rate response', {
                blockedUntil: new Date(youtubeQuotaBlockedUntil).toISOString(),
            });
            youtubeQuotaLogShown = true;
        }
        return [];
    }

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
    url.searchParams.set('maxResults',     String(Math.min(Math.max(limit, 1), 10)));
    url.searchParams.set('key',            apiKey);

    const res = await fetch(url.toString());

    if (!res.ok) {
        if (res.status === 403 || res.status === 429) {
            // Back off for a while when quota/rate limits are hit to avoid log spam
            // and repeated failed calls on every recommendation request.
            youtubeQuotaBlockedUntil = Date.now() + 30 * 60 * 1000;
            youtubeQuotaLogShown = false;
        }
        logger.error('YouTube search failed', { status: res.status });
        return [];
    }

    youtubeQuotaLogShown = false;

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
