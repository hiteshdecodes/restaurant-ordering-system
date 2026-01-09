import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import axios from 'axios';

const API_BASE = 'https://restaurant-ordering-system-5jxm.onrender.com/api';

const DashboardLogin = ({ onLoginSuccess }) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login form
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  // Register form
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/auth/dashboard/login`, loginData);
      localStorage.setItem('dashboardToken', response.data.token);
      localStorage.setItem('dashboardUser', JSON.stringify(response.data.user));
      onLoginSuccess(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/auth/dashboard/register`, {
        username: registerData.username,
        email: registerData.email,
        password: registerData.password
      });
      localStorage.setItem('dashboardToken', response.data.token);
      localStorage.setItem('dashboardUser', JSON.stringify(response.data.user));
      setSuccess('Owner registered successfully!');
      setTimeout(() => onLoginSuccess(response.data.user), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <LockIcon sx={{ fontSize: 40, color: '#2d5016', mr: 1 }} />
          <Typography variant="h4" sx={{ color: '#2d5016', fontWeight: 'bold' }}>
            Dashboard
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
          <Tab label="Login" />
          <Tab label="Register Owner" />
        </Tabs>

        {tabValue === 0 ? (
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={loginData.username}
              onChange={handleLoginChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={loginData.password}
              onChange={handleLoginChange}
              margin="normal"
              required
            />
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, backgroundColor: '#2d5016', '&:hover': { backgroundColor: '#1f3810' } }}
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={registerData.username}
              onChange={handleRegisterChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={registerData.email}
              onChange={handleRegisterChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={registerData.password}
              onChange={handleRegisterChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={registerData.confirmPassword}
              onChange={handleRegisterChange}
              margin="normal"
              required
            />
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, backgroundColor: '#2d5016', '&:hover': { backgroundColor: '#1f3810' } }}
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
          </form>
        )}
      </Paper>
    </Container>
  );
};

export default DashboardLogin;

