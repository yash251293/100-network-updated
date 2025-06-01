// lib/authClient.ts

const TOKEN_KEY = 'fake_jwt_token';

export const login = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    // Optionally, redirect to login or notify other parts of the app
    // For now, just removing the token. Redirection will be handled by ProtectedRoute or calling component.
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
