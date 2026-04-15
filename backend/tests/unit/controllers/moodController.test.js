import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockRecordMood = jest.fn();
const mockGetUserMoodHistory = jest.fn();
const mockGetRecentMoodEntries = jest.fn();
const mockGetUserMoodStats = jest.fn();
const mockRemoveMoodEntry = jest.fn();
const mockFormatMoodHistory = jest.fn();
const mockFormatWeeklyBreakdown = jest.fn();
const mockIsValidTimeZone = jest.fn();

jest.unstable_mockModule('../../../src/services/mood/moodService.js', () => ({
    recordMood: mockRecordMood,
    getUserMoodHistory: mockGetUserMoodHistory,
    getRecentMoodEntries: mockGetRecentMoodEntries,
    getUserMoodStats: mockGetUserMoodStats,
    removeMoodEntry: mockRemoveMoodEntry,
}));

jest.unstable_mockModule('../../../src/utils/historyFormatter.js', () => ({
    HistoryFormatter: {
        formatMoodHistory: mockFormatMoodHistory,
        formatWeeklyBreakdown: mockFormatWeeklyBreakdown,
        isValidTimeZone: mockIsValidTimeZone,
    },
}));

const { createMood, getHistory, getStats, deleteMood, getMoodTypes } = await import('../../../src/controllers/moodController.js');

function mockRes() {
    return {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        },
    };
}

describe('moodController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsValidTimeZone.mockReturnValue(true);
    });

    it('createMood should record mood and return 201', async () => {
        const req = { user: { uid: 'user-1' }, body: { mood: 'happy', intensity: 8, note: 'great' } };
        const res = mockRes();
        const next = jest.fn();

        mockRecordMood.mockResolvedValue({ id: 'm1', ...req.body, userId: 'user-1' });

        await createMood(req, res, next);

        expect(mockRecordMood).toHaveBeenCalledWith('user-1', req.body);
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(next).not.toHaveBeenCalled();
    });

    it('createMood should forward errors to next', async () => {
        const req = { user: { uid: 'user-1' }, body: { mood: 'happy' } };
        const res = mockRes();
        const next = jest.fn();
        const error = new Error('boom');
        mockRecordMood.mockRejectedValue(error);

        await createMood(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    it('getHistory should parse query values and return formatted data with weekly breakdown', async () => {
        const req = { user: { uid: 'user-1' }, query: { limit: '500', offset: '2', timezone: 'Europe/Istanbul' } };
        const res = mockRes();
        const next = jest.fn();
        const entries = [{ id: 'm1' }];
        const recentEntries = [{ id: 'm2' }];
        const formatted = { summary: { totalEntries: 1 }, history: entries, chartData: { labels: [], datasets: [] } };
        const weekly = { period: { startDate: '2026-04-01', endDate: '2026-04-07', timezone: 'Europe/Istanbul' }, days: [] };

        mockGetUserMoodHistory.mockResolvedValue(entries);
        mockGetRecentMoodEntries.mockResolvedValue(recentEntries);
        mockFormatMoodHistory.mockReturnValue(formatted);
        mockFormatWeeklyBreakdown.mockReturnValue(weekly);

        await getHistory(req, res, next);

        expect(mockGetUserMoodHistory).toHaveBeenCalledWith('user-1', { limit: 100, offset: 2 });
        expect(mockGetRecentMoodEntries).toHaveBeenCalledWith('user-1', { lookbackDays: 8 });
        expect(mockFormatMoodHistory).toHaveBeenCalledWith(entries);
        expect(mockFormatWeeklyBreakdown).toHaveBeenCalledWith(recentEntries, 'Europe/Istanbul');
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual({ ...formatted, weeklyBreakdown: weekly });
        expect(next).not.toHaveBeenCalled();
    });

    it('getHistory should return 400 for invalid timezone', async () => {
        const req = { user: { uid: 'user-1' }, query: { timezone: 'invalid/timezone' } };
        const res = mockRes();
        const next = jest.fn();

        mockIsValidTimeZone.mockReturnValue(false);

        await getHistory(req, res, next);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(mockGetUserMoodHistory).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('getStats should return service stats', async () => {
        const req = { user: { uid: 'user-1' } };
        const res = mockRes();
        const next = jest.fn();
        const stats = { total: 2, distribution: { happy: 2 } };

        mockGetUserMoodStats.mockResolvedValue(stats);

        await getStats(req, res, next);

        expect(mockGetUserMoodStats).toHaveBeenCalledWith('user-1');
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual(stats);
        expect(next).not.toHaveBeenCalled();
    });

    it('deleteMood should return 404 when entry does not exist', async () => {
        const req = { user: { uid: 'user-1' }, params: { id: 'missing' } };
        const res = mockRes();
        const next = jest.fn();

        mockRemoveMoodEntry.mockResolvedValue(null);

        await deleteMood(req, res, next);

        expect(mockRemoveMoodEntry).toHaveBeenCalledWith('missing', 'user-1');
        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(next).not.toHaveBeenCalled();
    });

    it('deleteMood should return success when deletion works', async () => {
        const req = { user: { uid: 'user-1' }, params: { id: 'm1' } };
        const res = mockRes();
        const next = jest.fn();

        mockRemoveMoodEntry.mockResolvedValue({ id: 'm1' });

        await deleteMood(req, res, next);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(next).not.toHaveBeenCalled();
    });

    it('getMoodTypes should return list of moods', () => {
        const res = mockRes();

        getMoodTypes({}, res);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data).toContain('happy');
    });
});
