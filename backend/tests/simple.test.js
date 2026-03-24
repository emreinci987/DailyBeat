/**
 * @file simple.test.js
 * @description DailyBeat — Temel Fonksiyon Testleri
 */

import { describe, test, expect } from '@jest/globals';
import MoodProfile, { availableMoods } from '../src/utils/moodMapping.js';
import { HistoryFormatter } from '../src/utils/historyFormatter.js';

// ── MoodProfile ───────────────────────────────────────────────────────────────
describe('MoodProfile', () => {
    test('happy → yüksek valence', () => {
        const profile = new MoodProfile('happy');
        expect(profile.targetValence).toBeGreaterThanOrEqual(0.7);
    });

    test('sad → düşük valence', () => {
        const profile = new MoodProfile('sad');
        expect(profile.targetValence).toBeLessThanOrEqual(0.3);
    });

    test('calm → düşük energy', () => {
        const profile = new MoodProfile('calm');
        expect(profile.targetEnergy).toBeLessThanOrEqual(0.3);
    });

    test('genres dizisi dönüyor', () => {
        const profile = new MoodProfile('energetic');
        expect(Array.isArray(profile.genres)).toBe(true);
        expect(profile.genres.length).toBeGreaterThan(0);
    });

    test('geçersiz giriş calm\'a düşüyor', () => {
        const profile = new MoodProfile('nonexistent');
        const calm = new MoodProfile('calm');
        expect(profile.genres).toEqual(calm.genres);
    });

    test('toSpotifySeed doğru format', () => {
        const seed = new MoodProfile('happy').toSpotifySeed();
        expect(seed).toHaveProperty('seed_genres');
        expect(seed).toHaveProperty('target_valence');
        expect(seed).toHaveProperty('target_energy');
    });
});

// ── HistoryFormatter ──────────────────────────────────────────────────────────
describe('HistoryFormatter', () => {
    const mockEntries = [
        { mood: 'happy', intensity: 8, timestamp: '2024-01-15T10:00:00Z' },
        { mood: 'sad', intensity: 3, timestamp: '2024-01-16T12:00:00Z' },
        { mood: 'happy', intensity: 7, timestamp: '2024-01-17T14:00:00Z' },
    ];

    test('normalizeTimestamps ISO formatında döndürüyor', () => {
        const normalized = HistoryFormatter.normalizeTimestamps(mockEntries);
        for (const entry of normalized) {
            expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        }
    });

    test('calculateSummary doğru sonuç', () => {
        const summary = HistoryFormatter.calculateSummary(mockEntries);
        expect(summary.totalEntries).toBe(3);
        expect(summary.moodDistribution.happy).toBe(2);
        expect(summary.moodDistribution.sad).toBe(1);
    });

    test('toChartJSFormat labels ve datasets içeriyor', () => {
        const chart = HistoryFormatter.toChartJSFormat(mockEntries);
        expect(chart.labels).toHaveLength(3);
        expect(chart.datasets).toHaveLength(1);
        expect(chart.datasets[0].data).toEqual([8, 3, 7]);
    });
});

// ── availableMoods ────────────────────────────────────────────────────────────
describe('availableMoods', () => {
    test('tüm beklenen mood\'lar listede', () => {
        expect(availableMoods).toContain('happy');
        expect(availableMoods).toContain('sad');
        expect(availableMoods).toContain('calm');
        expect(availableMoods).toContain('energetic');
    });
});
