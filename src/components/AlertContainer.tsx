import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { Alert, Box } from '@mui/material';
import type { RootState } from '../store';
import { hideAlert } from '../store/alertSlice';

const AlertContainer = () => {
  const alerts = useSelector((state: RootState) => state.alert.alerts);
  const dispatch = useDispatch();

  useEffect(() => {
    if (alerts.length === 0) return;

    // Auto-hide each alert after 5 seconds
    const timers = alerts.map((alert) =>
      setTimeout(() => {
        dispatch(hideAlert(alert.id));
      }, 5000)
    );

    // Cleanup timers on unmount or when alerts change
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [alerts, dispatch]);

  const handleClose = (id: string) => {
    dispatch(hideAlert(id));
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        maxWidth: 400,
      }}
    >
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          severity={alert.severity}
          onClose={() => handleClose(alert.id)}
          sx={{
            boxShadow: 3,
            animation: 'slideIn 0.3s ease-out',
            '@keyframes slideIn': {
              from: {
                transform: 'translateX(100%)',
                opacity: 0,
              },
              to: {
                transform: 'translateX(0)',
                opacity: 1,
              },
            },
            '@keyframes fadeOut': {
              from: {
                opacity: 1,
                transform: 'translateX(0)',
              },
              to: {
                opacity: 0,
                transform: 'translateX(100%)',
              },
            },
          }}
        >
          {alert.message}
        </Alert>
      ))}
    </Box>
  );
};

export default AlertContainer;
