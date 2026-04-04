import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ── Mocks ──
const mockGetSpotifyRecommendations = jest.fn();
const mockSearchSpotifyTracks = jest.fn();
const mockSearchYouTubeVideos = jest.fn();
const mockCreatePlaylist = jest.fn();
const mockLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };

jest.unstable_mockModule('../../../src/services/music/musicService.js', () => ({
    getSpotifyRecommendations: mockGetSpotifyRecommendations,
    searchSpotifyTracks: mockSearchSpotifyTracks,
    searchYouTubeVideos: mockSearchYouTubeVideos,
}));

jest.unstable_mockModule('../../../src/models/Playlist.js', () => ({
    default: { createPlaylist: mockCreatePlaylist },
    createPlaylist: mockCreatePlaylist,
}));

jest.unstable_mockModule('../../../src/utils/logger.js', () => ({ default: mockLogger }));

const { getRecommendations, getDiscovery } =
    await import('../../../src/services/recommendation/recommendationService.js');

beforeEach(() => {
    jest.clearAllMocks();
    mockSearchSpotifyTracks.mockResolvedValue([]);
});

// ─────────────────────────────────────────────────────────────
// getRecommendations
// ─────────────────────────────────────────────────────────────

describe('getRecommendations', () => {
    const spotifySongs = [
        { title: 'Spotify Song', artist: 'SA', url: 'https://spotify.com/1', source: 'spotify' },
    ];
    const ytSongs = [
        { title: 'YT Song', artist: 'YA', url: 'https://youtube.com/1', source: 'youtube' },
    ];

    it('should use Spotify recommendations for known mood', async () => {
        mockGetSpotifyRecommendations.mockResolvedValue(spotifySongs);

        const result = await getRecommendations('happy', { limit: 1 });

        expect(mockGetSpotifyRecommendations).toHaveBeenCalledWith(
            expect.objectContaining({ seed_genres: expect.any(String) }),
        );
        expect(result.songs[0]).toEqual(expect.objectContaining({
            title: 'Spotify Song',
            links: expect.objectContaining({ spotify: 'https://spotify.com/1' }),
        }));
        expect(result.playlist).toBeNull();
    });

    it('should fallback to YouTube when Spotify fails', async () => {
        mockGetSpotifyRecommendations.mockRejectedValue(new Error('Spotify down'));
        mockSearchYouTubeVideos.mockResolvedValue(ytSongs);

        const result = await getRecommendations('sad', { limit: 1 });

        expect(result.songs).toEqual(ytSongs);
        expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should supplement with Spotify search when recommendations are fewer than limit', async () => {
        mockGetSpotifyRecommendations.mockResolvedValue(spotifySongs);
        mockSearchSpotifyTracks.mockResolvedValue([
            { title: 'Spotify Song 2', artist: 'SB', url: 'https://spotify.com/2', source: 'spotify' },
        ]);

        const result = await getRecommendations('calm', { limit: 2 });

        expect(result.songs.length).toBe(2);
        expect(mockSearchSpotifyTracks).toHaveBeenCalled();
        expect(result.songs.every((song) => song.links?.spotify)).toBe(true);
    });

    it('should always return exactly requested limit when Spotify has sparse results', async () => {
        mockGetSpotifyRecommendations.mockResolvedValue(spotifySongs);
        mockSearchSpotifyTracks.mockResolvedValue([]);

        const result = await getRecommendations('happy', { limit: 10 });

        expect(result.songs).toHaveLength(10);
        expect(result.songs.every((song) => song.links?.spotify)).toBe(true);
    });

    it('should save playlist when save=true and userId provided', async () => {
        mockGetSpotifyRecommendations.mockResolvedValue(spotifySongs);
        mockCreatePlaylist.mockResolvedValue({ id: 'pl-1', mood: 'happy', songs: spotifySongs });

        const result = await getRecommendations('happy', {
            limit: 1,
            save: true,
            userId: 'user-1',
        });

        expect(mockCreatePlaylist).toHaveBeenCalledWith(
            expect.objectContaining({ userId: 'user-1', mood: 'happy' }),
        );
        expect(result.playlist).toBeDefined();
        expect(result.playlist.id).toBe('pl-1');
    });

    it('should vary Spotify seed with intensity', async () => {
        mockGetSpotifyRecommendations.mockResolvedValue(spotifySongs);

        await getRecommendations('happy', { limit: 1, intensity: 9 });

        expect(mockGetSpotifyRecommendations).toHaveBeenCalledWith(
            expect.objectContaining({
                target_energy: expect.any(Number),
                target_valence: expect.any(Number),
            }),
        );
    });

    it('should NOT save playlist when save=false', async () => {
        mockGetSpotifyRecommendations.mockResolvedValue(spotifySongs);

        const result = await getRecommendations('happy', { limit: 1, save: false });
        expect(mockCreatePlaylist).not.toHaveBeenCalled();
        expect(result.playlist).toBeNull();
    });

    it('should fallback to calm mapping for unknown mood', async () => {
        mockGetSpotifyRecommendations.mockResolvedValue(spotifySongs);

        const result = await getRecommendations('unknown-mood', { limit: 1 });

        expect(mockGetSpotifyRecommendations).toHaveBeenCalled();
        expect(result.songs[0]).toEqual(expect.objectContaining({
            title: spotifySongs[0].title,
            artist: spotifySongs[0].artist,
            links: expect.objectContaining({ spotify: spotifySongs[0].url }),
        }));
    });
});

// ─────────────────────────────────────────────────────────────
// getDiscovery
// ─────────────────────────────────────────────────────────────

describe('getDiscovery', () => {
    it('should return a genre and songs', async () => {
        const songs = [{ title: 'Jazz Song' }];
        mockSearchYouTubeVideos.mockResolvedValue(songs);

        const result = await getDiscovery('user-1');

        expect(result.genre).toBeDefined();
        expect(['jazz', 'classical', 'world-music', 'blues', 'reggae', 'latin', 'k-pop']).toContain(
            result.genre,
        );
        expect(result.songs).toEqual(songs);
    });

    it('should return empty songs array on failure', async () => {
        mockSearchYouTubeVideos.mockRejectedValue(new Error('YT down'));

        const result = await getDiscovery('user-1');

        expect(result.genre).toBeDefined();
        expect(result.songs).toEqual([]);
        expect(mockLogger.error).toHaveBeenCalled();
    });
});
