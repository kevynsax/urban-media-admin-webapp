import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import videoReducer from './videoSlice';
import alertReducer from './alertSlice';
import linkReducer from './linkSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    video: videoReducer,
    alert: alertReducer,
    link: linkReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
