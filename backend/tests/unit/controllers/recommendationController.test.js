import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ── Mocks ──
const mockGetRecommendations = jest.fn();
const mockGetDiscovery = jest.fn();

jest.unstable_mockModule('../../../src/services/recommendation/recommendationService.js', () => ({
    getRecommendations: mockGetRecommendations,
    getDiscovery: mockGetDiscovery,
    default: { getRecommendations: mockGetRecommendations, getDiscovery: mockGetDiscovery },
}));

jest.unstable_mockModule('../../../src/utils/apiResponse.js', () => ({
    successResponse: jest.fn((res, data, msg) => res.json({ success: true, data, message: msg })),
}));

const { getRecommendations, getDiscovery } =
    await import('../../../src/controllers/recommendationController.js');

beforeEach(() => {
    jest.clearAllMocks();
});

function createReqRes(body = {}, user = { uid: 'user-1' }) {
    const req = { body, user };
    const res = { json: jest.fn().mockReturnThis(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    return { req, res, next };
}

describe('recommendationController.getRecommendations', () => {
    it('should call service with correct parameters', async () => {
        mockGetRecommendations.mockResolvedValue({ songs: [{ title: 'A' }], playlist: null });
        const { req, res, next } = createReqRes({ mood: 'happy', limit: 5, save: false });

        await getRecommendations(req, res, next);

        expect(mockGetRecommendations).toHaveBeenCalledWith('happy', {
            intensity: 5,
            limit: 5,
            save: false,
            userId: 'user-1',
        });
        expect(res.json).toHaveBeenCalled();
    });

    it('should use default values', async () => {
        mockGetRecommendations.mockResolvedValue({ songs: [], playlist: null });
        const { req, res, next } = createReqRes({ mood: 'sad' });

        await getRecommendations(req, res, next);

        expect(mockGetRecommendations).toHaveBeenCalledWith('sad', {
            intensity: 5,
            limit: 10,
            save: false,
            userId: 'user-1',
        });
    });

    it('should forward errors to next', async () => {
        const error = new Error('fail');
        mockGetRecommendations.mockRejectedValue(error);
        const { req, res, next } = createReqRes({ mood: 'happy' });

        await getRecommendations(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});

describe('recommendationController.getDiscovery', () => {
    it('should call service with userId', async () => {
        mockGetDiscovery.mockResolvedValue({ genre: 'jazz', songs: [] });
        const { req, res, next } = createReqRes();

        await getDiscovery(req, res, next);

        expect(mockGetDiscovery).toHaveBeenCalledWith('user-1');
        expect(res.json).toHaveBeenCalled();
    });

    it('should forward errors to next', async () => {
        const error = new Error('discovery fail');
        mockGetDiscovery.mockRejectedValue(error);
        const { req, res, next } = createReqRes();

        await getDiscovery(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});
