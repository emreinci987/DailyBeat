import { describe, it, expect } from '@jest/globals';
import MoodProfile, { availableMoods } from '../../../src/utils/moodMapping.js';

describe('moodMapping utilities', () => {
    it('should export a non-empty list of available moods', () => {
        expect(Array.isArray(availableMoods)).toBe(true);
        expect(availableMoods.length).toBeGreaterThan(0);
    });

    it('should return correct mapping for "happy"', () => {
        const m = MoodProfile.getMoodMapping('happy');
        expect(m.genres).toContain('pop');
        expect(m.target_valence).toBeGreaterThanOrEqual(0.5);
        expect(m.keywords.length).toBeGreaterThan(0);
    });

    it('should return correct mapping for "sad"', () => {
        const m = MoodProfile.getMoodMapping('sad');
        expect(m.target_valence).toBeLessThanOrEqual(0.4);
        expect(m.target_energy).toBeLessThanOrEqual(0.5);
    });

    it('should be case-insensitive', () => {
        const upper = MoodProfile.getMoodMapping('HAPPY');
        const lower = MoodProfile.getMoodMapping('happy');
        expect(upper).toEqual(lower);
    });

    it('should fall back to calm for unknown moods', () => {
        const unknown = MoodProfile.getMoodMapping('nonexistent');
        const calm = MoodProfile.getMoodMapping('calm');
        expect(unknown).toEqual(calm);
    });

    it('should handle empty / null input gracefully', () => {
        expect(() => MoodProfile.getMoodMapping(null)).not.toThrow();
        expect(() => MoodProfile.getMoodMapping('')).not.toThrow();
        expect(() => MoodProfile.getMoodMapping(undefined)).not.toThrow();
    });

    it('should have genres, target_valence, target_energy, and keywords for every mood', () => {
        for (const mood of availableMoods) {
            const m = MoodProfile.getMoodMapping(mood);
            expect(m.genres.length).toBeGreaterThan(0);
            expect(typeof m.target_valence).toBe('number');
            expect(typeof m.target_energy).toBe('number');
            expect(m.keywords.length).toBeGreaterThan(0);
        }
    });

    it('should create a MoodProfile instance with correct properties', () => {
        const profile = new MoodProfile('happy');
        expect(profile.genres).toContain('pop');
        expect(profile.targetValence).toBeGreaterThanOrEqual(0.5);
        expect(profile.keywords.length).toBeGreaterThan(0);
    });

    it('should generate Spotify seed object', () => {
        const profile = new MoodProfile('energetic');
        const seed = profile.toSpotifySeed();
        expect(seed).toHaveProperty('seed_genres');
        expect(seed).toHaveProperty('target_valence');
        expect(seed).toHaveProperty('target_energy');
    });
});
