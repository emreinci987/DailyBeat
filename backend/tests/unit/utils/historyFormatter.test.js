import { describe, it, expect } from '@jest/globals';
import { HistoryFormatter } from '../../../src/utils/historyFormatter.js';

describe('HistoryFormatter weekly breakdown', () => {
    it('should return exactly 7 days with period metadata', () => {
        const data = HistoryFormatter.formatWeeklyBreakdown([], 'UTC');

        expect(data.period).toBeDefined();
        expect(data.period.timezone).toBe('UTC');
        expect(Array.isArray(data.days)).toBe(true);
        expect(data.days).toHaveLength(7);
    });

    it('should aggregate mood counts by local day', () => {
        const entries = [
            { id: '1', mood: 'happy', intensity: 7, createdAt: new Date().toISOString() },
            { id: '2', mood: 'happy', intensity: 6, createdAt: new Date().toISOString() },
            { id: '3', mood: 'sad', intensity: 4, createdAt: new Date().toISOString() },
        ];

        const data = HistoryFormatter.formatWeeklyBreakdown(entries, 'UTC');
        const today = data.days[data.days.length - 1];

        expect(today.totalEntries).toBe(3);
        expect(today.moodCounts.happy).toBe(2);
        expect(today.moodCounts.sad).toBe(1);
    });

    it('should ignore entries with invalid timestamps', () => {
        const entries = [
            { id: '1', mood: 'happy', intensity: 7, createdAt: new Date().toISOString() },
            { id: '2', mood: 'sad', intensity: 4, createdAt: 'invalid-date' },
            { id: '3', mood: 'calm', intensity: 5 },
        ];

        const formatted = HistoryFormatter.formatMoodHistory(entries);
        const weekly = HistoryFormatter.formatWeeklyBreakdown(entries, 'UTC');

        expect(formatted.history).toHaveLength(1);
        expect(weekly.days[weekly.days.length - 1].totalEntries).toBe(1);
    });

    it('should expose Turkish day names', () => {
        const data = HistoryFormatter.formatWeeklyBreakdown([], 'UTC');
        expect(typeof data.days[0].dayName).toBe('string');
        expect(data.days[0].dayName.length).toBeGreaterThan(0);
    });

    it('should validate timezone correctly', () => {
        expect(HistoryFormatter.isValidTimeZone('UTC')).toBe(true);
        expect(HistoryFormatter.isValidTimeZone('Europe/Istanbul')).toBe(true);
        expect(HistoryFormatter.isValidTimeZone('invalid/timezone')).toBe(false);
    });
});
