const isProduction = import.meta.env.PROD;

export const AppConfig = {
  get baseUrl(): string {
    if (isProduction) {
      return 'https://urbi.kirschnerklava.com/api';
    }
    return 'http://localhost:8080/api';
  },

  appName: 'Urban Media Admin',

  endpoints: {
    login: '/login',
    videos: '/videos',
    videoStatus: (id: string) => `/videos/status/${id}`,
    deleteVideo: (id: string) => `/videos/${id}`,
  },

  storage: {
    tokenKey: 'auth_token',
    userKey: 'user_data',
  },
};
