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

export async function getRecentMoodEntries(userId, { lookbackDays = 8 } = {}) {
    const sinceDate = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString();

    try {
        return await MoodEntry.getMoodEntriesSince(userId, sinceDate);
    } catch (_error) {
        const fallbackEntries = await MoodEntry.getMoodEntriesByUser(userId, { limit: 500, offset: 0 });
        return fallbackEntries.filter((entry) => {
            const rawTimestamp = entry.createdAt || entry.timestamp;
            const parsed = rawTimestamp?.toDate instanceof Function
                ? rawTimestamp.toDate()
                : new Date(rawTimestamp);

            if (!parsed || Number.isNaN(parsed.getTime())) {
                return false;
            }

            return parsed.toISOString() >= sinceDate;
        });
    }
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
    await MoodEntry.deleteMoodEntry(entryId, entry.userId);
    return entry;
}
