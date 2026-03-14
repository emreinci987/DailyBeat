/**
 * Maps mood values to music genres/attributes for Spotify & YouTube queries.
 *
 * Moods are normalised lowercase strings.  Each maps to:
 *  - genres   : Spotify seed_genres values
 *  - valence  : Spotify audio-feature range [min, max] (0 = sad, 1 = happy)
 *  - energy   : Spotify audio-feature range [min, max]
 *  - keywords : fallback search keywords (YouTube)
 */

const moodMap = {
    happy: {
        genres: ['pop', 'dance', 'happy'],
        valence: [0.7, 1.0],
        energy: [0.6, 1.0],
        keywords: ['happy', 'upbeat', 'feel good'],
    },
    sad: {
        genres: ['acoustic', 'piano', 'sad'],
        valence: [0.0, 0.3],
        energy: [0.0, 0.4],
        keywords: ['sad', 'melancholy', 'emotional'],
    },
    energetic: {
        genres: ['edm', 'work-out', 'power-pop'],
        valence: [0.5, 1.0],
        energy: [0.8, 1.0],
        keywords: ['energetic', 'workout', 'pump up'],
    },
    calm: {
        genres: ['ambient', 'chill', 'classical'],
        valence: [0.3, 0.6],
        energy: [0.0, 0.3],
        keywords: ['calm', 'relaxing', 'peaceful'],
    },
    angry: {
        genres: ['metal', 'hard-rock', 'punk'],
        valence: [0.0, 0.3],
        energy: [0.7, 1.0],
        keywords: ['angry', 'aggressive', 'intense'],
    },
    romantic: {
        genres: ['r-n-b', 'soul', 'jazz'],
        valence: [0.5, 0.8],
        energy: [0.2, 0.5],
        keywords: ['romantic', 'love', 'sensual'],
    },
    anxious: {
        genres: ['ambient', 'new-age', 'sleep'],
        valence: [0.2, 0.5],
        energy: [0.0, 0.3],
        keywords: ['anxiety relief', 'soothing', 'meditation'],
    },
    nostalgic: {
        genres: ['indie', 'folk', 'singer-songwriter'],
        valence: [0.3, 0.6],
        energy: [0.2, 0.5],
        keywords: ['nostalgic', 'throwback', 'memories'],
    },
    focused: {
        genres: ['study', 'electronic', 'minimal-techno'],
        valence: [0.3, 0.6],
        energy: [0.3, 0.6],
        keywords: ['focus', 'concentration', 'study music'],
    },
};

/**
 * Return the mapping for a mood string, falling back to 'calm' if unknown.
 */
export function getMoodMapping(mood) {
    const key = (mood || '').toLowerCase().trim();
    return moodMap[key] || moodMap.calm;
}

export const availableMoods = Object.keys(moodMap);

export default moodMap;
