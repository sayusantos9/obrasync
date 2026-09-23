const defaultApiUrl = 'http://localhost:3333';

export const environment = Object.freeze({
  apiUrl: (process.env.EXPO_PUBLIC_API_URL || defaultApiUrl).replace(/\/$/, ''),
});
