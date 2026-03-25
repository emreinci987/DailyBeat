import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockCreateMoodEntry = jest.fn();
const mockGetMoodEntriesByUser = jest.fn();
const mockGetMoodStats = jest.fn();
const mockGetMoodEntryById = jest.fn();
const mockDeleteMoodEntry = jest.fn();

jest.unstable_mockModule('../../../src/models/MoodEntry.js', () => ({
    default: {
        createMoodEntry: mockCreateMoodEntry,
        getMoodEntriesByUser: mockGetMoodEntriesByUser,
        getMoodStats: mockGetMoodStats,
        getMoodEntryById: mockGetMoodEntryById,
        deleteMoodEntry: mockDeleteMoodEntry,
    },
}));

const {
    recordMood,
    getUserMoodHistory,
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

        expect(mockDeleteMoodEntry).toHaveBeenCalledWith('m1');
        expect(result).toEqual(entry);
    });
});
