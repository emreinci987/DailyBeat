/**
 * Maps mood values to music attributes for Spotify & YouTube queries.
 */

const moodMap = {
    happy: {
        genres: ['pop', 'dance', 'happy'],
        target_valence: 0.8,
        target_energy: 0.7,
        keywords: ['happy', 'upbeat', 'feel good'],
    },
    sad: {
        genres: ['acoustic', 'piano', 'sad'],
        target_valence: 0.2,
        target_energy: 0.3,
        keywords: ['sad', 'melancholy', 'emotional'],
    },
    energetic: {
        genres: ['edm', 'work-out', 'power-pop'],
        target_valence: 0.7,
        target_energy: 0.9,
        keywords: ['energetic', 'workout', 'pump up'],
    },
    calm: {
        genres: ['ambient', 'chill', 'classical'],
        target_valence: 0.5,
        target_energy: 0.2,
        keywords: ['calm', 'relaxing', 'peaceful'],
    },
    angry: {
        genres: ['metal', 'hard-rock', 'punk'],
        target_valence: 0.2,
        target_energy: 0.8,
        keywords: ['angry', 'aggressive', 'intense'],
    },
    romantic: {
        genres: ['r-n-b', 'soul', 'jazz'],
        target_valence: 0.6,
        target_energy: 0.4,
        keywords: ['romantic', 'love', 'sensual'],
    },
    anxious: {
        genres: ['ambient', 'new-age', 'sleep'],
        target_valence: 0.4,
        target_energy: 0.2,
        keywords: ['anxiety relief', 'soothing', 'meditation'],
    },
    nostalgic: {
        genres: ['indie', 'folk', 'singer-songwriter'],
        target_valence: 0.5,
        target_energy: 0.4,
        keywords: ['nostalgic', 'throwback', 'memories'],
    },
    focused: {
        genres: ['study', 'electronic', 'minimal-techno'],
        target_valence: 0.5,
        target_energy: 0.5,
        keywords: ['focus', 'concentration', 'study music'],
    },
};

/**
 * Represents the musical profile of a mood.
 */
export class MoodProfile {
    constructor(mood) {
        const key = (mood || '').toLowerCase().trim();
        const mapping = moodMap[key] || moodMap.calm;

        this.mood = key;
        this.genres = mapping.genres;
        this.keywords = mapping.keywords;
        this.targetValence = mapping.target_valence;
        this.targetEnergy = mapping.target_energy;
    }

    /**
     * Get the Spotify recommendation seed object.
     * @returns {object}
     */
    toSpotifySeed() {
        return {
            seed_genres: this.genres.join(','),
            target_valence: this.targetValence,
            target_energy: this.targetEnergy,
        };
    }

    /**
     * Get a random keyword for fallback searches.
     * @returns {string}
     */
    getRandomKeyword() {
        return this.keywords[Math.floor(Math.random() * this.keywords.length)];
    }

    /**
     * Get the base mood mapping.
     * @param {string} mood - The mood string.
     * @returns {object}
     */
    static getMoodMapping(mood) {
        const key = (mood || '').toLowerCase().trim();
        return moodMap[key] || moodMap.calm;
    }
}

export const availableMoods = Object.keys(moodMap);

export default MoodProfile;

