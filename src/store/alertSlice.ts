import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type AlertSeverity = 'success' | 'error' | 'warning' | 'info';

interface Alert {
  id: string;
  message: string;
  severity: AlertSeverity;
}

interface AlertState {
  alerts: Alert[];
}

const initialState: AlertState = {
  alerts: [],
};

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    showAlert: (
      state,
      action: PayloadAction<{ message: string; severity: AlertSeverity }>
    ) => {
      const id = Date.now().toString();
      state.alerts.push({
        id,
        message: action.payload.message,
        severity: action.payload.severity,
      });
    },
    hideAlert: (state, action: PayloadAction<string>) => {
      state.alerts = state.alerts.filter((alert) => alert.id !== action.payload);
    },
    clearAlerts: (state) => {
      state.alerts = [];
    },
  },
});

export const { showAlert, hideAlert, clearAlerts } = alertSlice.actions;
export default alertSlice.reducer;
