/**
 * Centralised HTTP client for the DailyBeat API.
 *
 * In development the Vite dev server proxies /api → backend:3001.
 * In production the frontend and API share the same origin.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';
export const TOKEN_STORAGE_KEY = 'dailybeat_token';

export function getStoredToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token) {
    if (!token) return;
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
}

async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Attach auth token if available
    const token = getStoredToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
        const error = new Error(data?.message || res.statusText);
        error.status = res.status;
        error.data = data;
        throw error;
    }

    return data;
}

// ── Auth ──
export const authAPI = {
    register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    forgotPassword: (body) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
    me: () => request('/auth/me'),
};

// ── Mood ──
export const moodAPI = {
    create: (body) => request('/mood', { method: 'POST', body: JSON.stringify(body) }),
    history: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/mood/history?${qs}`);
    },
    stats: () => request('/mood/stats'),
    types: () => request('/mood/types'),
    remove: (id) => request(`/mood/${id}`, { method: 'DELETE' }),
};

// ── Music ──
export const musicAPI = {
    search: (q, source = 'spotify', limit = 10) =>
        request(`/music/search?q=${encodeURIComponent(q)}&source=${source}&limit=${limit}`),
};

// ── Recommendations ──
export const recommendationAPI = {
    get: (body) => request('/recommendations', { method: 'POST', body: JSON.stringify(body) }),
    discover: () => request('/recommendations/discover'),
};

// ── Users ──
export const userAPI = {
    profile: () => request('/users/profile'),
    updateProfile: (body) => request('/users/profile', { method: 'PUT', body: JSON.stringify(body) }),
    playlists: () => request('/users/playlists'),
    deletePlaylist: (id) => request(`/users/playlists/${id}`, { method: 'DELETE' }),
};

// ── Feedback ──
export const feedbackAPI = {
    create: (body) => request('/feedback', { method: 'POST', body: JSON.stringify(body) }),
    list: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/feedback?${qs}`);
    },
    remove: (id) => request(`/feedback/${id}`, { method: 'DELETE' }),
};

export default { authAPI, moodAPI, musicAPI, recommendationAPI, userAPI, feedbackAPI };
