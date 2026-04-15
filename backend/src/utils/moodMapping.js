/**
 * Maps mood values to music attributes for Spotify & YouTube queries.
 */

const spotifySeedGenreWhitelist = new Set([
    'acoustic',
    'ambient',
    'blues',
    'classical',
    'dance',
    'disco',
    'edm',
    'electronic',
    'folk',
    'indie',
    'jazz',
    'k-pop',
    'latin',
    'metal',
    'new-age',
    'pop',
    'punk',
    'r-n-b',
    'reggae',
    'rock',
    'singer-songwriter',
    'soul',
]);

function sanitizeSeedGenres(genres) {
    const filtered = (genres || []).filter((genre) => spotifySeedGenreWhitelist.has(genre));
    return filtered.length > 0 ? filtered : ['pop'];
}

const moodMap = {
    happy: {
        genres: ['pop', 'dance', 'disco'],
        target_valence: 0.8,
        target_energy: 0.7,
        keywords: ['upbeat', 'feel good'],
        artistHints: ['Dua Lipa', 'Bruno Mars', 'Pharrell Williams', 'Justin Timberlake'],
    },
    sad: {
        genres: ['acoustic', 'singer-songwriter', 'folk'],
        target_valence: 0.2,
        target_energy: 0.3,
        keywords: ['sad', 'melancholy', 'emotional'],
        artistHints: ['Adele', 'Billie Eilish', 'Lewis Capaldi', 'Sam Smith'],
    },
    energetic: {
        genres: ['edm', 'dance', 'electronic'],
        target_valence: 0.7,
        target_energy: 0.9,
        keywords: ['energetic', 'workout', 'pump up'],
        artistHints: ['Calvin Harris', 'David Guetta', 'Martin Garrix', 'Skrillex'],
    },
    calm: {
        genres: ['ambient', 'classical', 'new-age'],
        target_valence: 0.5,
        target_energy: 0.2,
        keywords: ['calm', 'relaxing', 'peaceful'],
        artistHints: ['Ludovico Einaudi', 'Yiruma', 'Nils Frahm', 'Olafur Arnalds'],
    },
    angry: {
        genres: ['metal', 'rock', 'punk'],
        target_valence: 0.2,
        target_energy: 0.8,
        keywords: ['angry', 'aggressive', 'intense'],
        artistHints: ['Linkin Park', 'Metallica', 'Bring Me The Horizon', 'Slipknot'],
    },
    romantic: {
        genres: ['r-n-b', 'soul', 'jazz'],
        target_valence: 0.6,
        target_energy: 0.4,
        keywords: ['romantic', 'love', 'sensual'],
        artistHints: ['The Weeknd', 'John Legend', 'Daniel Caesar', 'Sade'],
    },
    anxious: {
        genres: ['ambient', 'new-age', 'classical'],
        target_valence: 0.4,
        target_energy: 0.2,
        keywords: ['anxiety relief', 'soothing', 'meditation'],
        artistHints: ['Moby', 'Brian Eno', 'Max Richter', 'Explosions in the Sky'],
    },
    nostalgic: {
        genres: ['indie', 'folk', 'singer-songwriter'],
        target_valence: 0.5,
        target_energy: 0.4,
        keywords: ['nostalgic', 'throwback', 'memories'],
        artistHints: ['Coldplay', 'The Beatles', 'Fleetwood Mac', 'Arctic Monkeys'],
    },
    focused: {
        genres: ['classical', 'ambient', 'electronic'],
        target_valence: 0.5,
        target_energy: 0.5,
        keywords: ['focus', 'concentration', 'study music'],
        artistHints: ['Hans Zimmer', 'Lofi Girl', 'Tycho', 'Daft Punk'],
    },
};

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function randomJitter(range) {
    return (Math.random() * 2 - 1) * range;
}

function roundToThreeDecimals(value) {
    return Math.round(value * 1000) / 1000;
}

/**
 * Represents the musical profile of a mood.
 */
export class MoodProfile {
    constructor(mood) {
        const key = (mood || '').toLowerCase().trim();
        const mapping = moodMap[key] || moodMap.calm;

        this.mood = key;
        this.genres = sanitizeSeedGenres(mapping.genres);
        this.keywords = mapping.keywords;
        this.artistHints = mapping.artistHints || [];
        this.targetValence = mapping.target_valence;
        this.targetEnergy = mapping.target_energy;
    }

    /**
     * Get the Spotify recommendation seed object.
     * @returns {object}
     */
    toSpotifySeed(intensity = 5) {
        const normalizedIntensity = clamp(Number(intensity) || 5, 1, 10);
        const intensityFactor = (normalizedIntensity - 5) / 5;

        // Shuffle genres to avoid deterministic ordering on repeated requests.
        const shuffledGenres = [...this.genres].sort(() => Math.random() - 0.5);
        const adjustedValence = clamp(
            this.targetValence + intensityFactor * 0.12 + randomJitter(0.06),
            0,
            1,
        );
        const adjustedEnergy = clamp(
            this.targetEnergy + intensityFactor * 0.2 + randomJitter(0.08),
            0,
            1,
        );

        return {
            seed_genres: shuffledGenres.slice(0, 3).join(','),
            target_valence: roundToThreeDecimals(adjustedValence),
            target_energy: roundToThreeDecimals(adjustedEnergy),
        };
    }

    /**
     * Get a random keyword for fallback searches.
     * @returns {string}
     */
    getRandomKeyword() {
        return this.keywords[Math.floor(Math.random() * this.keywords.length)];
    }

    getRandomArtistHint() {
        if (!this.artistHints.length) return null;
        return this.artistHints[Math.floor(Math.random() * this.artistHints.length)];
    }

    /**
     * Get the base mood mapping.
     * @param {string} mood - The mood string.
     * @returns {object}
     */
    static getMoodMapping(mood) {
        const key = (mood || '').toLowerCase().trim();
        const mapping = moodMap[key] || moodMap.calm;
        return {
            ...mapping,
            genres: sanitizeSeedGenres(mapping.genres),
        };
    }
}

export const availableMoods = Object.keys(moodMap);

export default MoodProfile;

