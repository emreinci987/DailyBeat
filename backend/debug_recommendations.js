
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import * as musicService from './src/services/music/musicService.js';
import * as recommendationService from './src/services/recommendation/recommendationService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function debug() {
    console.log('--- Debugging Music Service ---');
    try {
        console.log('\nTesting Minimal Spotify Recommendations (seed_genres: "pop"):');
        const token = await musicService.getSpotifyToken();
        const minRecRes = await fetch('https://api.spotify.com/v1/recommendations?seed_genres=pop&limit=1', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Minimal Rec Status:', minRecRes.status);
        if (minRecRes.ok) {
            console.log('Minimal Rec Data:', await minRecRes.json());
        }

        console.log('\nTesting Spotify Browse (New Releases):');
        const browseRes = await fetch('https://api.spotify.com/v1/browse/new-releases?limit=1', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Browse Status:', browseRes.status);

        console.log('\nTesting Spotify Recommendations (mood: happy) via service:');
        const recResults = await recommendationService.getRecommendations('happy', { limit: 5 });
        console.log('Recommendation Results Count:', recResults.songs.length);

        console.log('\nTesting YouTube Fallback (query: "happy music"):');
        const ytResults = await musicService.searchYouTubeVideos('happy music', 2);
        console.log('YouTube Results:', JSON.stringify(ytResults, null, 2));

    } catch (error) {
        console.error('Debug Error:', error);
    }
}

debug();
