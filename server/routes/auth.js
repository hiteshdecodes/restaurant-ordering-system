const express = require('express');
const router = express.Router();

// In-memory OTP storage (use Redis in production)
const otpStorage = new Map();

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP endpoint
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone || !phone.match(/^\+91[6-9]\d{9}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    const otp = generateOTP();
    
    // Store OTP with 5-minute expiry
    otpStorage.set(phone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0
    });

    // TODO: Integrate with SMS service (Twilio, MSG91, etc.)
    // For demo purposes, we'll just log the OTP
    console.log(`📱 OTP for ${phone}: ${otp}`);
    
    // In production, send SMS here:
    // await sendSMS(phone, `Your OTP is: ${otp}. Valid for 5 minutes.`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // Remove this in production - only for demo
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
});

// Verify OTP endpoint
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }

    const storedData = otpStorage.get(phone);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired'
      });
    }

    // Check if OTP is expired
    if (Date.now() > storedData.expiresAt) {
      otpStorage.delete(phone);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Check attempts limit
    if (storedData.attempts >= 3) {
      otpStorage.delete(phone);
      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP'
      });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      storedData.attempts++;
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${3 - storedData.attempts} attempts remaining`
      });
    }

    // OTP verified successfully
    otpStorage.delete(phone);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      verified: true
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
});

// Resend OTP endpoint
router.post('/resend-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Check if there's an existing OTP that's still valid
    const existingData = otpStorage.get(phone);
    if (existingData && Date.now() < existingData.expiresAt - 4 * 60 * 1000) {
      return res.status(400).json({
        success: false,
        message: 'Please wait before requesting a new OTP'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    
    otpStorage.set(phone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0
    });

    console.log(`📱 Resent OTP for ${phone}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP resent successfully',
      // Remove this in production
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });

  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP'
    });
  }
});

module.exports = router;
