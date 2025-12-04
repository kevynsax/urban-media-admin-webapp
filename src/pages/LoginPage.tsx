import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    IconButton,
    InputAdornment,
    CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import type { RootState } from '../store';
import { login, clearError } from '../store/authSlice';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { showAlert } from '../store/alertSlice';

const LoginPage = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isLoading, error, isAuthenticated } = useSelector(
        (state: RootState) => state.auth
    );

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/videos');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (error) {
            dispatch(showAlert({ message: error, severity: 'error' }));
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phoneNumber || !password) {
            dispatch(
                showAlert({
                    message: 'Please enter phone number and password',
                    severity: 'warning',
                })
            );
            return;
        }
        dispatch(login({ phoneNumber, password }));
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 2,
            }}
        >
            <Card
                sx={{
                    maxWidth: 400,
                    width: '100%',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
            >
                <CardContent sx={{ padding: 4 }}>
                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        sx={{
                            fontWeight: 700,
                            textAlign: 'center',
                            mb: 3,
                            background: 'black',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Urbi Admin
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Phone Number"
                            variant="outlined"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            margin="normal"
                            autoComplete="tel"
                            disabled={isLoading}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            margin="normal"
                            autoComplete="current-password"
                            disabled={isLoading}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            type="submit"
                            disabled={isLoading}
                            sx={{
                                mt: 3,
                                py: 1.5,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                    background:
                                        'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                                },
                            }}
                        >
                            {isLoading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default LoginPage;
