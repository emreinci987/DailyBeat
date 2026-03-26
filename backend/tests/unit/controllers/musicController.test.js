import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ── Mocks ──
const mockSearchSpotifyTracks = jest.fn();
const mockSearchYouTubeVideos = jest.fn();

jest.unstable_mockModule('../../../src/services/music/musicService.js', () => ({
    searchSpotifyTracks: mockSearchSpotifyTracks,
    searchYouTubeVideos: mockSearchYouTubeVideos,
}));

jest.unstable_mockModule('../../../src/utils/apiResponse.js', () => ({
    successResponse: jest.fn((res, data, msg) => res.json({ success: true, data, message: msg })),
}));

const { searchMusic } = await import('../../../src/controllers/musicController.js');

beforeEach(() => {
    jest.clearAllMocks();
});

function createReqRes(query = {}) {
    const req = { query };
    const res = { json: jest.fn().mockReturnThis(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    return { req, res, next };
}

describe('musicController.searchMusic', () => {
    it('should use Spotify by default', async () => {
        mockSearchSpotifyTracks.mockResolvedValue([{ title: 'A' }]);
        const { req, res, next } = createReqRes({ q: 'test' });

        await searchMusic(req, res, next);

        expect(mockSearchSpotifyTracks).toHaveBeenCalledWith('test', 10);
        expect(mockSearchYouTubeVideos).not.toHaveBeenCalled();
    });

    it('should use YouTube when source=youtube', async () => {
        mockSearchYouTubeVideos.mockResolvedValue([{ title: 'B' }]);
        const { req, res, next } = createReqRes({ q: 'test', source: 'youtube' });

        await searchMusic(req, res, next);

        expect(mockSearchYouTubeVideos).toHaveBeenCalledWith('test', 10);
        expect(mockSearchSpotifyTracks).not.toHaveBeenCalled();
    });

    it('should respect limit parameter', async () => {
        mockSearchSpotifyTracks.mockResolvedValue([]);
        const { req, res, next } = createReqRes({ q: 'test', limit: '5' });

        await searchMusic(req, res, next);

        expect(mockSearchSpotifyTracks).toHaveBeenCalledWith('test', 5);
    });

    it('should cap limit at 50', async () => {
        mockSearchSpotifyTracks.mockResolvedValue([]);
        const { req, res, next } = createReqRes({ q: 'test', limit: '200' });

        await searchMusic(req, res, next);

        expect(mockSearchSpotifyTracks).toHaveBeenCalledWith('test', 50);
    });

    it('should call next on error', async () => {
        const error = new Error('boom');
        mockSearchSpotifyTracks.mockRejectedValue(error);
        const { req, res, next } = createReqRes({ q: 'test' });

        await searchMusic(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});
