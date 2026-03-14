import { describe, it, expect } from '@jest/globals';
import { getMoodMapping, availableMoods } from '../../../src/utils/moodMapping.js';

describe('moodMapping utilities', () => {
    it('should export a non-empty list of available moods', () => {
        expect(Array.isArray(availableMoods)).toBe(true);
        expect(availableMoods.length).toBeGreaterThan(0);
    });

    it('should return correct mapping for "happy"', () => {
        const m = getMoodMapping('happy');
        expect(m.genres).toContain('pop');
        expect(m.valence[0]).toBeGreaterThanOrEqual(0.5);
        expect(m.keywords.length).toBeGreaterThan(0);
    });

    it('should return correct mapping for "sad"', () => {
        const m = getMoodMapping('sad');
        expect(m.valence[1]).toBeLessThanOrEqual(0.4);
        expect(m.energy[1]).toBeLessThanOrEqual(0.5);
    });

    it('should be case-insensitive', () => {
        const upper = getMoodMapping('HAPPY');
        const lower = getMoodMapping('happy');
        expect(upper).toEqual(lower);
    });

    it('should fall back to calm for unknown moods', () => {
        const unknown = getMoodMapping('nonexistent');
        const calm = getMoodMapping('calm');
        expect(unknown).toEqual(calm);
    });

    it('should handle empty / null input gracefully', () => {
        expect(() => getMoodMapping(null)).not.toThrow();
        expect(() => getMoodMapping('')).not.toThrow();
        expect(() => getMoodMapping(undefined)).not.toThrow();
    });

    it('should have genres, valence, energy, and keywords for every mood', () => {
        for (const mood of availableMoods) {
            const m = getMoodMapping(mood);
            expect(m.genres.length).toBeGreaterThan(0);
            expect(m.valence).toHaveLength(2);
            expect(m.energy).toHaveLength(2);
            expect(m.keywords.length).toBeGreaterThan(0);
        }
    });
});
