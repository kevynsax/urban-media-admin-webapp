import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { Alert, Box } from '@mui/material';
import type { RootState } from '../store';
import { hideAlert } from '../store/alertSlice';

const AlertContainer = () => {
  const alerts = useSelector((state: RootState) => state.alert.alerts);
  const dispatch = useDispatch();

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
          }}
        >
          {alert.message}
        </Alert>
      ))}
    </Box>
  );
};

export default AlertContainer;
