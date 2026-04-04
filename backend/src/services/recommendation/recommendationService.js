import MoodProfile from '../../utils/moodMapping.js';
import {
    getSpotifyRecommendations,
    searchSpotifyTracks,
    searchYouTubeVideos,
} from '../music/musicService.js';
import Playlist from '../../models/Playlist.js';
import logger from '../../utils/logger.js';

const youtubeLinkCache = new Map();
const fallbackPopularArtists = [
    'The Weeknd',
    'Dua Lipa',
    'Taylor Swift',
    'Ed Sheeran',
    'Billie Eilish',
    'Bruno Mars',
    'Coldplay',
    'Arctic Monkeys',
    'Eminem',
    'Adele',
];

function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function dedupeSongs(songs) {
    const seen = new Set();
    return songs.filter((song) => {
        const key = `${(song.title || '').toLowerCase()}|${(song.artist || '').toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function normalizeGenreForQuery(genre) {
    return String(genre || '')
        .replace(/-/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function padSongsToLimit(songs, targetLimit) {
    if (songs.length === 0 || songs.length >= targetLimit) {
        return songs.slice(0, targetLimit);
    }

    const padded = [...songs];
    let index = 0;
    while (padded.length < targetLimit) {
        padded.push({ ...songs[index % songs.length] });
        index += 1;
    }
    return padded;
}

function buildArtistFocusedQueries(moodProfile, intensity, needed = 1) {
    const descriptor = intensity >= 8 ? 'popular energetic tracks' : intensity <= 3 ? 'popular chill tracks' : 'popular tracks';
    const genreHints = moodProfile.genres.slice(0, 2).map((genre) => normalizeGenreForQuery(genre));
    const queries = [];

    for (let i = 0; i < needed; i += 1) {
        const artist = moodProfile.getRandomArtistHint();
        if (artist) {
            queries.push(`artist:"${artist}" ${descriptor}`);
        }
    }

    if (queries.length === 0) {
        queries.push(`${genreHints.join(' ')} ${descriptor}`.trim());
    }

    return queries;
}

async function topUpSpotifySongs(songs, moodProfile, intensity, targetLimit) {
    const nextSongs = [...songs];
    const queryCount = 4;
    const artistQueries = buildArtistFocusedQueries(moodProfile, intensity, queryCount);
    const genreQueries = [
        `${moodProfile.genres.slice(0, 2).map((genre) => normalizeGenreForQuery(genre)).join(' ')} popular tracks`.trim(),
        `${moodProfile.genres.slice(0, 2).map((genre) => normalizeGenreForQuery(genre)).join(' ')} global hits`.trim(),
    ];
    const popularArtistQueries = shuffle(fallbackPopularArtists)
        .slice(0, 4)
        .map((artist) => `artist:"${artist}" popular songs`);

    const allQueries = [...artistQueries, ...genreQueries, ...popularArtistQueries, 'global top hits'];

    for (const query of allQueries) {
        if (nextSongs.length >= targetLimit) break;
        const stillNeeded = targetLimit - nextSongs.length;
        const fetched = await searchSpotifyTracks(query, Math.min(stillNeeded * 2, 20));
        if (fetched.length > 0) {
            nextSongs.push(...fetched);
        }
    }

    return nextSongs;
}

function toSpotifyAppUrl(spotifyUrl) {
    const match = spotifyUrl?.match(/track\/([a-zA-Z0-9]+)/);
    return match ? `spotify:track:${match[1]}` : null;
}

async function attachYouTubeLinks(spotifySongs) {
    const result = [];

    for (const song of spotifySongs) {
        const baseSong = {
            ...song,
            links: {
                spotify: song.url,
            },
            spotifyAppUrl: toSpotifyAppUrl(song.url),
        };

        const cacheKey = `${(song.title || '').toLowerCase()}|${(song.artist || '').toLowerCase()}`;
        if (youtubeLinkCache.has(cacheKey)) {
            const cachedYoutubeUrl = youtubeLinkCache.get(cacheKey);
            if (cachedYoutubeUrl) {
                result.push({
                    ...baseSong,
                    links: {
                        ...baseSong.links,
                        youtube: cachedYoutubeUrl,
                    },
                });
            } else {
                result.push(baseSong);
            }
            continue;
        }

        try {
            const query = `${song.title} ${song.artist} official audio`;
            const ytResults = await searchYouTubeVideos(query, 1);
            const ytMatch = ytResults?.[0];

            if (!ytMatch?.url) {
                youtubeLinkCache.set(cacheKey, null);
                result.push(baseSong);
                continue;
            }

            youtubeLinkCache.set(cacheKey, ytMatch.url);
            result.push({
                ...baseSong,
                links: {
                    ...baseSong.links,
                    youtube: ytMatch.url,
                },
            });
        } catch (err) {
            logger.warn('YouTube link matching failed for track', {
                title: song.title,
                artist: song.artist,
                error: err.message,
            });
            result.push(baseSong);
        }
    }

    return result;
}

/**
 * Generate music recommendations based on mood,
 * and optionally persist as a playlist.
 */

export async function getRecommendations(
    mood,
    { intensity = 5, limit = 10, save = false, userId = null } = {},
) {
    const moodProfile = new MoodProfile(mood);
    let songs = [];
    const cappedLimit = Math.min(Math.max(limit, 1), 50);

    // Try Spotify first with an enlarged pool so each request can be shuffled.
    try {
        const spotifySeed = moodProfile.toSpotifySeed(intensity);
        const poolLimit = Math.min(Math.max(cappedLimit * 4, 20), 50);

        const spotifyRecommendations = await getSpotifyRecommendations({
            ...spotifySeed,
            limit: poolLimit,
        });

        songs = [...spotifyRecommendations];

        // If recommendations are scarce, fill with additional Spotify search results.
        if (songs.length < cappedLimit) {
            songs = await topUpSpotifySongs(songs, moodProfile, intensity, cappedLimit);
        }

        songs = dedupeSongs(songs);
        if (songs.length < cappedLimit) {
            songs = await topUpSpotifySongs(songs, moodProfile, intensity, cappedLimit);
            songs = dedupeSongs(songs);
        }

        songs = shuffle(songs);
        songs = padSongsToLimit(songs, cappedLimit);

        if (songs.length > 0) {
            songs = await attachYouTubeLinks(songs);
        }
    } catch (err) {
        logger.warn('Spotify recommendations failed, falling back to YouTube', { error: err.message });
    }

    // Fallback to YouTube only if Spotify couldn't produce results.
    if (songs.length === 0) {
        try {
            const artistHint = moodProfile.getRandomArtistHint();
            const keyword = moodProfile.getRandomKeyword();
            const ytResults = await searchYouTubeVideos(
                artistHint ? `${artistHint} official audio` : `${keyword} official audio`,
                cappedLimit,
            );
            songs = shuffle(ytResults).slice(0, cappedLimit);
        } catch (err) {
            logger.warn('YouTube search also failed', { error: err.message });
        }
    }

    if (songs.length > 0 && songs.length < cappedLimit) {
        songs = padSongsToLimit(songs, cappedLimit);
    }

    // Optionally save as a playlist
    let playlist = null;
    if (save && userId && songs.length > 0) {
        playlist = await Playlist.createPlaylist({ userId, mood, songs });
    }

    return { songs, playlist };
}

/**
 * "Discovery mode" – returns a random selection from an unexpected genre.
 */
export async function getDiscovery(userId) {
    const surpriseGenres = ['jazz', 'classical', 'world-music', 'blues', 'reggae', 'latin', 'k-pop'];
    const genre = surpriseGenres[Math.floor(Math.random() * surpriseGenres.length)];

    try {
        const songs = await searchYouTubeVideos(`${genre} music discover`, 5);
        return { genre, songs };
    } catch (err) {
        logger.error('Discovery mode failed', { error: err.message });
        return { genre, songs: [] };
    }
}

export default { getRecommendations, getDiscovery };
