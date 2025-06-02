// lib/authClient.ts

const TOKEN_KEY = 'fake_jwt_token';

export const login = (token: string): void => {
  if (typeof window !== 'undefined') {
    console.log('[authClient] login: Received token:', token); // Log received token
    try {
      localStorage.setItem(TOKEN_KEY, token);
      console.log('[authClient] login: localStorage.setItem called successfully.'); // Log success
      const storedToken = localStorage.getItem(TOKEN_KEY);
      console.log('[authClient] login: Token retrieved immediately after setItem:', storedToken); // Log token retrieved
      if (token !== storedToken) {
        console.warn('[authClient] login: WARNING! Token set and token retrieved do NOT match immediately after setItem.');
      }
    } catch (error) {
      console.error('[authClient] login: Error during localStorage.setItem or getItem:', error);
    }
  } else {
    console.warn('[authClient] login: Called on server-side, localStorage not available.');
  }
};

export const logout = (): void => {
  if (typeof window !== 'undefined') {
    const tokenBefore = localStorage.getItem(TOKEN_KEY);
    console.log('[authClient] logout: Token before removal:', tokenBefore);
    localStorage.removeItem(TOKEN_KEY);
    const tokenAfter = localStorage.getItem(TOKEN_KEY);
    console.log('[authClient] logout: Token after removal:', tokenAfter);
    if (tokenAfter !== null) {
      console.warn('[authClient] logout: WARNING! Token still present after removeItem attempt.');
    }
  } else {
    console.warn('[authClient] logout: Called on server-side.');
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};
