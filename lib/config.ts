// API Configuration
export const config = {
  // Update this URL to point to your backend server
  // API_BASE_URL: "http://192.168.31.96:4500",
  API_BASE_URL: "https://cookly-backend.vercel.app",

  // API timeout in milliseconds
  API_TIMEOUT: 10000,

  // Default recipe generation parameters
  DEFAULT_SERVINGS: 4,
  MAX_INGREDIENTS: 20,

  // Pagination
  DEFAULT_PAGE_SIZE: 20,

  // AsyncStorage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: "auth_token",
    USER_DATA: "user_data",
  },
} as const;

export default config;
