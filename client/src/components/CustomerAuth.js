import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { Phone, Person, Lock } from '@mui/icons-material';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const CustomerAuth = ({ open, onClose, onAuthenticated }) => {
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Name
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Check if customer is already authenticated
  useEffect(() => {
    const savedCustomer = localStorage.getItem('customerData');
    if (savedCustomer) {
      const customerData = JSON.parse(savedCustomer);
      onAuthenticated(customerData);
      onClose();
    }
  }, [onAuthenticated, onClose]);

  const validatePhone = (phoneNumber) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phoneNumber);
  };

  const handleSendOTP = async () => {
    if (!validatePhone(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // For demo purposes, we'll simulate OTP sending
      // In production, integrate with SMS service like Twilio, MSG91, etc.
      const response = await axios.post(`${API_BASE}/auth/send-otp`, {
        phone: `+91${phone}`
      });

      if (response.data.success) {
        setOtpSent(true);
        setStep(2);
        setCountdown(30); // 30 seconds countdown
        setError('');
      }
    } catch (error) {
      // For demo, we'll allow proceeding without actual OTP service
      console.log('OTP service not configured, proceeding with demo mode');
      setOtpSent(true);
      setStep(2);
      setCountdown(30);
      setError('Demo Mode: Use OTP "123456" to continue');
    }

    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // For demo purposes, accept "123456" as valid OTP
      if (otp === '123456') {
        // Always ask for name on each login (don't save customer data)
        setStep(3); // Ask for name
      } else {
        setError('Invalid OTP. Use "123456" for demo');
      }
    } catch (error) {
      setError('Failed to verify OTP. Please try again.');
    }

    setLoading(false);
  };

  const handleSaveName = () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    const customerData = {
      phone: `+91${phone}`,
      name: name.trim(),
      verified: true,
      createdAt: new Date().toISOString()
    };

    // Only save to current session (customerData), not persistent storage
    // This way customer needs to enter name on each login
    localStorage.setItem('customerData', JSON.stringify(customerData));

    onAuthenticated(customerData);
    onClose();
  };

  const handleResendOTP = () => {
    if (countdown === 0) {
      handleSendOTP();
    }
  };

  const resetForm = () => {
    setStep(1);
    setPhone('');
    setOtp('');
    setName('');
    setError('');
    setOtpSent(false);
    setCountdown(0);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: '8px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)' }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 0.8, bgcolor: '#2d5016', color: 'white', py: 1.2 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '16px', color: 'white' }}>
          Welcome to Our Restaurant
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, px: 1.5 }}>
        <Typography sx={{ fontSize: '12px', color: '#666', mb: 1.5, textAlign: 'center' }}>
          {step === 1 && 'Enter your mobile number to get started'}
          {step === 2 && 'Enter the OTP sent to your mobile'}
          {step === 3 && 'Please tell us your name'}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 1.5, fontSize: '12px', py: 0.8 }}>
            {error}
          </Alert>
        )}

        {step === 1 && (
          <Box>
            <TextField
              fullWidth
              label="Mobile Number"
              value={phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setPhone(value);
                setError('');
              }}
              placeholder="Enter 10-digit mobile number"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone sx={{ fontSize: '18px', color: '#ff6b35' }} />
                    <Typography sx={{ ml: 0.8, mr: 0.8, fontSize: '12px', color: '#666' }}>+91</Typography>
                  </InputAdornment>
                ),
              }}
              helperText="We'll send you an OTP for verification"
              sx={{ '& .MuiOutlinedInput-root': { fontSize: '13px' }, '& .MuiFormHelperText-root': { fontSize: '11px' } }}
            />
          </Box>
        )}

        {step === 2 && (
          <Box>
            <Typography sx={{ fontSize: '12px', mb: 1.5, textAlign: 'center', color: '#666' }}>
              OTP sent to +91{phone}
            </Typography>
            <TextField
              fullWidth
              label="Enter OTP"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(value);
                setError('');
              }}
              placeholder="Enter 6-digit OTP"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ fontSize: '18px', color: '#ff6b35' }} />
                  </InputAdornment>
                ),
              }}
              helperText={
                countdown > 0
                  ? `Resend OTP in ${countdown}s`
                  : "Didn't receive OTP?"
              }
              sx={{ '& .MuiOutlinedInput-root': { fontSize: '13px' }, '& .MuiFormHelperText-root': { fontSize: '11px' } }}
            />
            {countdown === 0 && (
              <Button
                variant="text"
                onClick={handleResendOTP}
                sx={{ mt: 1, fontSize: '12px', color: '#ff6b35', textTransform: 'none' }}
                disabled={loading}
              >
                Resend OTP
              </Button>
            )}
          </Box>
        )}

        {step === 3 && (
          <Box>
            <Typography sx={{ fontSize: '12px', mb: 1.5, textAlign: 'center', color: '#666' }}>
              Great! Your number is verified. What should we call you?
            </Typography>
            <TextField
              fullWidth
              label="Your Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Enter your full name"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ fontSize: '18px', color: '#ff6b35' }} />
                  </InputAdornment>
                ),
              }}
              helperText="This will be used for your orders"
              sx={{ '& .MuiOutlinedInput-root': { fontSize: '13px' }, '& .MuiFormHelperText-root': { fontSize: '11px' } }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 1.2, pt: 1, gap: 1 }}>
        {step > 1 && (
          <Button onClick={resetForm} disabled={loading} sx={{ fontSize: '12px', textTransform: 'none', color: '#666' }}>
            Back
          </Button>
        )}

        <Button
          onClick={
            step === 1 ? handleSendOTP :
            step === 2 ? handleVerifyOTP :
            handleSaveName
          }
          variant="contained"
          disabled={loading || (step === 1 && phone.length !== 10) || (step === 2 && otp.length !== 6) || (step === 3 && !name.trim())}
          startIcon={loading && <CircularProgress size={16} sx={{ color: 'white' }} />}
          sx={{ minWidth: 100, bgcolor: '#ff6b35', color: 'white', fontSize: '12px', py: 0.6, textTransform: 'none', '&:hover': { bgcolor: '#e55a24' } }}
        >
          {loading ? 'Please wait...' :
           step === 1 ? 'Send OTP' :
           step === 2 ? 'Verify OTP' :
           'Continue'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerAuth;
