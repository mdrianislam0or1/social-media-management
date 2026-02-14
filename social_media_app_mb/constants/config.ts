export const API_BASE_URL = 'https://social-media-api-eta.vercel.app/api';

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
  },
  POSTS: {
    CREATE: '/posts',
    GET_ALL: '/posts',
    LIKE: (postId: string) => `/posts/${postId}/like`,
    COMMENT: (postId: string) => `/posts/${postId}/comment`,
  },
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  FCM_TOKEN: 'fcm_token',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
};
