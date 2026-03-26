import MoodEntry from '../../models/MoodEntry.js';

/**
 * Business logic around mood entries.
 */

export async function recordMood(userId, moodData) {
    return MoodEntry.createMoodEntry({ userId, ...moodData });
}

export async function getUserMoodHistory(userId, options) {
    return MoodEntry.getMoodEntriesByUser(userId, options);
}

export async function getUserMoodStats(userId) {
    return MoodEntry.getMoodStats(userId);
}

export async function removeMoodEntry(entryId, userId) {
    const entry = await MoodEntry.getMoodEntryById(entryId);
    if (!entry) return null;
    if (entry.userId !== userId) {
        throw Object.assign(new Error('Bu kaydı silme yetkiniz yok'), { status: 403, expose: true });
    }
    await MoodEntry.deleteMoodEntry(entryId);
    return entry;
}
