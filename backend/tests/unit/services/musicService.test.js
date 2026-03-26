import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ── Mocks ──
const mockLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };

jest.unstable_mockModule('../../../src/utils/logger.js', () => ({ default: mockLogger }));
jest.unstable_mockModule('../../../src/config/environment.js', () => ({
    default: {
        spotify: { clientId: 'test-id', clientSecret: 'test-secret' },
        youtube: { apiKey: 'test-yt-key' },
    },
}));

// Mock fetch globally
let mockFetch;

beforeEach(() => {
    jest.clearAllMocks();
    mockFetch = jest.fn();
    global.fetch = mockFetch;
});

const { searchSpotifyTracks, getSpotifyRecommendations, searchYouTubeVideos } =
    await import('../../../src/services/music/musicService.js');

// ─────────────────────────────────────────────────────────────
// SPOTIFY TOKEN
// ─────────────────────────────────────────────────────────────

describe('Spotify Token', () => {
    it('should obtain access token via Client Credentials', async () => {
        // Token call
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ access_token: 'tok-123', expires_in: 3600 }),
        });
        // Search call
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ tracks: { items: [] } }),
        });

        await searchSpotifyTracks('test');

        const tokenCall = mockFetch.mock.calls[0];
        expect(tokenCall[0]).toBe('https://accounts.spotify.com/api/token');
        expect(tokenCall[1].method).toBe('POST');
        expect(tokenCall[1].body).toBe('grant_type=client_credentials');
    });
});

// ─────────────────────────────────────────────────────────────
// SPOTIFY SEARCH
// ─────────────────────────────────────────────────────────────

describe('searchSpotifyTracks', () => {
    it('should return formatted tracks', async () => {
        // Token is cached from the 'Spotify Token' describe block above
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ tracks: { items: [
                {
                    name: 'Song A',
                    artists: [{ name: 'Artist A' }],
                    album: { name: 'Album A', images: [{ url: 'thumb.jpg' }] },
                    external_urls: { spotify: 'https://open.spotify.com/track/1' },
                    preview_url: 'https://preview.mp3',
                },
            ] } }),
        });

        const results = await searchSpotifyTracks('test');
        expect(results).toHaveLength(1);
        expect(results[0]).toEqual({
            title: 'Song A',
            artist: 'Artist A',
            album: 'Album A',
            url: 'https://open.spotify.com/track/1',
            thumbnailUrl: 'thumb.jpg',
            previewUrl: 'https://preview.mp3',
            source: 'spotify',
        });
    });

    it('should return empty array on API failure', async () => {
        // Token is cached, only mock the search API call
        mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

        const results = await searchSpotifyTracks('fail');
        expect(results).toEqual([]);
    });
});

// ─────────────────────────────────────────────────────────────
// SPOTIFY RECOMMENDATIONS
// ─────────────────────────────────────────────────────────────

describe('getSpotifyRecommendations', () => {
    it('should call recommendations endpoint with correct params', async () => {
        // Token is cached, only mock the recommendation API call
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                tracks: [
                    {
                        name: 'Rec Song',
                        artists: [{ name: 'Rec Artist' }],
                        album: { name: 'Rec Album', images: [] },
                        external_urls: { spotify: 'https://spotify.com/rec' },
                        preview_url: null,
                    },
                ],
            }),
        });

        const results = await getSpotifyRecommendations({
            seed_genres: 'pop,dance',
            target_valence: 0.8,
            target_energy: 0.7,
            limit: 5,
        });

        expect(results).toHaveLength(1);
        expect(results[0].title).toBe('Rec Song');
        expect(results[0].source).toBe('spotify');

        const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
        const recUrl = new URL(lastCall[0]);
        expect(recUrl.searchParams.get('seed_genres')).toBe('pop,dance');
        expect(recUrl.searchParams.get('target_valence')).toBe('0.8');
        expect(recUrl.searchParams.get('target_energy')).toBe('0.7');
        expect(recUrl.searchParams.get('limit')).toBe('5');
    });

    it('should limit seed_genres to 5', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ tracks: [] }),
        });

        await getSpotifyRecommendations({
            seed_genres: 'a,b,c,d,e,f,g',
            target_valence: 0.5,
            target_energy: 0.5,
        });

        // Token may be cached from previous test, so the recommendation call
        // could be at index 0 or 1 depending on cache state
        const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
        const recUrl = new URL(lastCall[0]);
        const genres = recUrl.searchParams.get('seed_genres').split(',');
        expect(genres.length).toBeLessThanOrEqual(5);
    });
});

// ─────────────────────────────────────────────────────────────
// YOUTUBE SEARCH
// ─────────────────────────────────────────────────────────────

describe('searchYouTubeVideos', () => {
    it('should return formatted results', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                items: [
                    {
                        id: { videoId: 'yt1' },
                        snippet: {
                            title: 'YT Song',
                            channelTitle: 'YT Channel',
                            thumbnails: { high: { url: 'yt-thumb.jpg' } },
                        },
                    },
                ],
            }),
        });

        const results = await searchYouTubeVideos('test');
        expect(results).toHaveLength(1);
        expect(results[0]).toEqual({
            title: 'YT Song',
            artist: 'YT Channel',
            album: null,
            url: 'https://www.youtube.com/watch?v=yt1',
            thumbnailUrl: 'yt-thumb.jpg',
            previewUrl: null,
            source: 'youtube',
        });
    });

    it('should return empty array on API failure', async () => {
        mockFetch.mockResolvedValueOnce({ ok: false, status: 403 });

        const results = await searchYouTubeVideos('fail');
        expect(results).toEqual([]);
    });
});
