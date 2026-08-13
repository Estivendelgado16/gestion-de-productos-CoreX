const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = isLocal ? 'http://localhost:3002' : 'https://tolla-backend.onrender.com';

export const AUTH_TOKEN_KEY = 'accessToken';

export const AUTH_USER_KEY = 'currentUser';
