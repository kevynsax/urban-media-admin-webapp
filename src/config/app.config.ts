const isProduction = import.meta.env.PROD;

export const AppConfig = {
  get baseUrl(): string {
    if (isProduction) {
      return '/api';
    }
    return 'http://localhost:8080/api';
  },

  appName: 'Urbi Admin',

  storage: {
    tokenKey: 'auth_token',
    userKey: 'user_data',
  },
};
