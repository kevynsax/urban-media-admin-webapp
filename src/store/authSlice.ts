import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../services/api.service';
import { AppConfig } from '../config/app.config';
import type { User, LoginRequest } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Load auth from localStorage
const loadAuthFromStorage = (): { user: User | null; token: string | null } => {
  try {
    const token = localStorage.getItem(AppConfig.storage.tokenKey);
    const userData = localStorage.getItem(AppConfig.storage.userKey);
    if (token && userData) {
      return {
        token,
        user: JSON.parse(userData) as User,
      };
    }
  } catch (error) {
    console.error('Failed to load auth from storage:', error);
  }
  return { user: null, token: null };
};

// Save auth to localStorage
const saveAuthToStorage = (token: string, user: User) => {
  localStorage.setItem(AppConfig.storage.tokenKey, token);
  localStorage.setItem(AppConfig.storage.userKey, JSON.stringify(user));
};

// Clear auth from localStorage
const clearAuthFromStorage = () => {
  localStorage.removeItem(AppConfig.storage.tokenKey);
  localStorage.removeItem(AppConfig.storage.userKey);
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.login(credentials);
      saveAuthToStorage(response.token, response.data);
      apiService.setToken(response.token);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Login failed'
      );
    }
  }
);

export const tryAutoLogin = createAsyncThunk(
  'auth/tryAutoLogin',
  async (_, { rejectWithValue }) => {
    try {
      const { token, user } = loadAuthFromStorage();
      if (token && user) {
        apiService.setToken(token);
        return { token, user };
      }
      return rejectWithValue('No stored credentials');
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Auto-login failed'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      clearAuthFromStorage();
      apiService.setToken(null);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Auto-login
      .addCase(tryAutoLogin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(tryAutoLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(tryAutoLogin.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
