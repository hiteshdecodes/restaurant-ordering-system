console.log('Testing dependencies...');

try {
  const express = require('express');
  console.log('✅ Express loaded');
  
  const cors = require('cors');
  console.log('✅ CORS loaded');
  
  const http = require('http');
  console.log('✅ HTTP loaded');
  
  const socketIo = require('socket.io');
  console.log('✅ Socket.io loaded');
  
  const QRCode = require('qrcode');
  console.log('✅ QRCode loaded');
  
  console.log('🎉 All dependencies loaded successfully!');
  
  // Test basic express server
  const app = express();
  const server = http.createServer(app);
  
  app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
  });
  
  server.listen(5000, () => {
    console.log('🚀 Test server running on port 5000');
    console.log('Visit: http://localhost:5000/test');
  });
  
} catch (error) {
  console.error('❌ Error loading dependencies:', error.message);
}
