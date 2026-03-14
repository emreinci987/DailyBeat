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
    return (data.tracks?.items || []).map((t) => ({
        title: t.name,
        artist: t.artists.map((a) => a.name).join(', '),
        album: t.album.name,
        url: t.external_urls.spotify,
        thumbnailUrl: t.album.images?.[0]?.url || '',
        previewUrl: t.preview_url || '',
        source: 'spotify',
    }));
}

export async function getSpotifyRecommendations({ genres, valence, energy, limit = 10 }) {
    const token = await getSpotifyToken();
    if (!token) return [];

    const url = new URL('https://api.spotify.com/v1/recommendations');
    url.searchParams.set('seed_genres', genres.slice(0, 5).join(','));
    url.searchParams.set('min_valence', String(valence[0]));
    url.searchParams.set('max_valence', String(valence[1]));
    url.searchParams.set('min_energy', String(energy[0]));
    url.searchParams.set('max_energy', String(energy[1]));
    url.searchParams.set('limit', String(limit));

    const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        logger.error('Spotify recommendations failed', { status: res.status });
        return [];
    }

    const data = await res.json();
    return (data.tracks || []).map((t) => ({
        title: t.name,
        artist: t.artists.map((a) => a.name).join(', '),
        album: t.album.name,
        url: t.external_urls.spotify,
        thumbnailUrl: t.album.images?.[0]?.url || '',
        previewUrl: t.preview_url || '',
        source: 'spotify',
    }));
}

// ── YouTube helpers ──────────────────────────────────────────

export async function searchYouTubeVideos(query, limit = 10) {
    const { apiKey } = environment.youtube;
    if (!apiKey) {
        logger.warn('YouTube API key not configured');
        return [];
    }

    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('type', 'video');
    url.searchParams.set('videoCategoryId', '10'); // Music
    url.searchParams.set('q', query);
    url.searchParams.set('maxResults', String(limit));
    url.searchParams.set('key', apiKey);

    const res = await fetch(url.toString());

    if (!res.ok) {
        logger.error('YouTube search failed', { status: res.status });
        return [];
    }

    const data = await res.json();
    return (data.items || []).map((item) => ({
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        thumbnailUrl: item.snippet.thumbnails?.high?.url || '',
        source: 'youtube',
    }));
}

export default { searchSpotifyTracks, getSpotifyRecommendations, searchYouTubeVideos };
