const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

console.log('Starting Restaurant Ordering System Server...');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'menu-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Make upload middleware available globally
app.locals.upload = upload;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_ordering')
  .then(async () => {
    console.log('✅ Connected to MongoDB successfully');
    console.log('Database:', process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_ordering');

    // Initialize Counter for order numbers (daily reset with date prefix)
    try {
      const Counter = require('./models/Counter');
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear()).slice(-2);
      const datePrefix = `${day}${month}${year}`;
      const counterId = `orderNumber_${datePrefix}`;

      const existingCounter = await Counter.findById(counterId);
      if (!existingCounter) {
        await Counter.create({ _id: counterId, sequence_value: 0, date: datePrefix });
        console.log('✅ Initialized order number counter for today:', datePrefix);
      } else {
        console.log('✅ Order number counter already exists for today:', datePrefix);
      }
    } catch (error) {
      console.error('Error initializing counter:', error.message);
    }

    // Drop old unique index on orderNumber if it exists
    try {
      const db = mongoose.connection.db;
      const indexes = await db.collection('orders').getIndexes();
      if (indexes.orderNumber_1) {
        await db.collection('orders').dropIndex('orderNumber_1');
        console.log('✅ Dropped old orderNumber unique index');
      }
    } catch (error) {
      console.log('ℹ️ No old index to drop or error:', error.message);
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('Make sure MongoDB is running on your system');
    console.log('You can start MongoDB with: mongod');
    process.exit(1);
  });

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-dashboard', () => {
    socket.join('dashboard');
    console.log('Client joined dashboard room');
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/menu-items', require('./routes/menuItems'));
app.use('/api/tables', require('./routes/tables'));
app.use('/api/orders', require('./routes/orders'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Restaurant Ordering System API' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Customer Menu: http://localhost:${PORT === 5000 ? 3000 : PORT}/menu?table=1`);
  console.log(`📊 Dashboard: http://localhost:${PORT === 5000 ? 3000 : PORT}/dashboard`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
});
