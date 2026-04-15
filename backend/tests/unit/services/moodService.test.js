import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockCreateMoodEntry = jest.fn();
const mockGetMoodEntriesByUser = jest.fn();
const mockGetMoodEntriesSince = jest.fn();
const mockGetMoodStats = jest.fn();
const mockGetMoodEntryById = jest.fn();
const mockDeleteMoodEntry = jest.fn();

jest.unstable_mockModule('../../../src/models/MoodEntry.js', () => ({
    default: {
        createMoodEntry: mockCreateMoodEntry,
        getMoodEntriesByUser: mockGetMoodEntriesByUser,
        getMoodEntriesSince: mockGetMoodEntriesSince,
        getMoodStats: mockGetMoodStats,
        getMoodEntryById: mockGetMoodEntryById,
        deleteMoodEntry: mockDeleteMoodEntry,
    },
}));

const {
    recordMood,
    getUserMoodHistory,
    getRecentMoodEntries,
    getUserMoodStats,
    removeMoodEntry,
} = await import('../../../src/services/mood/moodService.js');

describe('moodService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('recordMood should merge userId into payload', async () => {
        mockCreateMoodEntry.mockResolvedValue({ id: 'm1', userId: 'u1', mood: 'happy' });

        const result = await recordMood('u1', { mood: 'happy', intensity: 6, note: 'ok' });

        expect(mockCreateMoodEntry).toHaveBeenCalledWith({ userId: 'u1', mood: 'happy', intensity: 6, note: 'ok' });
        expect(result).toEqual({ id: 'm1', userId: 'u1', mood: 'happy' });
    });

    it('getUserMoodHistory should call model with options', async () => {
        mockGetMoodEntriesByUser.mockResolvedValue([{ id: 'm1' }]);

        const result = await getUserMoodHistory('u1', { limit: 20, offset: 5 });

        expect(mockGetMoodEntriesByUser).toHaveBeenCalledWith('u1', { limit: 20, offset: 5 });
        expect(result).toEqual([{ id: 'm1' }]);
    });

    it('getUserMoodStats should call model', async () => {
        mockGetMoodStats.mockResolvedValue({ total: 1, distribution: { happy: 1 } });

        const result = await getUserMoodStats('u1');

        expect(mockGetMoodStats).toHaveBeenCalledWith('u1');
        expect(result.total).toBe(1);
    });

    it('getRecentMoodEntries should call model with computed since date', async () => {
        mockGetMoodEntriesSince.mockResolvedValue([{ id: 'm1' }]);

        const result = await getRecentMoodEntries('u1', { lookbackDays: 8 });

        expect(mockGetMoodEntriesSince).toHaveBeenCalledTimes(1);
        expect(mockGetMoodEntriesSince).toHaveBeenCalledWith('u1', expect.any(String));
        expect(new Date(mockGetMoodEntriesSince.mock.calls[0][1]).toString()).not.toBe('Invalid Date');
        expect(result).toEqual([{ id: 'm1' }]);
    });

    it('getRecentMoodEntries should fallback to getMoodEntriesByUser when range query fails', async () => {
        const now = new Date().toISOString();
        const old = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();

        mockGetMoodEntriesSince.mockRejectedValue(new Error('index missing'));
        mockGetMoodEntriesByUser.mockResolvedValue([
            { id: 'm1', createdAt: now },
            { id: 'm2', createdAt: old },
            { id: 'm3', createdAt: 'invalid' },
        ]);

        const result = await getRecentMoodEntries('u1', { lookbackDays: 8 });

        expect(mockGetMoodEntriesByUser).toHaveBeenCalledWith('u1', { limit: 500, offset: 0 });
        expect(result.map((entry) => entry.id)).toEqual(['m1']);
    });

    it('removeMoodEntry should return null when entry not found', async () => {
        mockGetMoodEntryById.mockResolvedValue(null);

        const result = await removeMoodEntry('missing', 'u1');

        expect(result).toBeNull();
        expect(mockDeleteMoodEntry).not.toHaveBeenCalled();
    });

    it('removeMoodEntry should throw 403 for non-owner', async () => {
        mockGetMoodEntryById.mockResolvedValue({ id: 'm1', userId: 'u2' });

        await expect(removeMoodEntry('m1', 'u1')).rejects.toMatchObject({
            status: 403,
            expose: true,
        });

        expect(mockDeleteMoodEntry).not.toHaveBeenCalled();
    });

    it('removeMoodEntry should delete and return entry for owner', async () => {
        const entry = { id: 'm1', userId: 'u1', mood: 'happy' };
        mockGetMoodEntryById.mockResolvedValue(entry);
        mockDeleteMoodEntry.mockResolvedValue(undefined);

        const result = await removeMoodEntry('m1', 'u1');

        expect(mockDeleteMoodEntry).toHaveBeenCalledWith('m1', 'u1');
        expect(result).toEqual(entry);
    });
});
