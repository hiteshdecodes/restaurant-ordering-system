console.log('🚀 Starting Restaurant Ordering System Server...');

const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const QRCode = require('qrcode');

console.log('✅ All modules loaded successfully');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (temporary solution)
let categories = [
  {
    _id: '1',
    name: 'Appetizers',
    description: 'Start your meal with our delicious appetizers',
    image: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400',
    sortOrder: 1
  },
  {
    _id: '2',
    name: 'Main Course',
    description: 'Hearty and satisfying main dishes',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
    sortOrder: 2
  },
  {
    _id: '3',
    name: 'Desserts',
    description: 'Sweet endings to your perfect meal',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
    sortOrder: 3
  },
  {
    _id: '4',
    name: 'Beverages',
    description: 'Refreshing drinks and beverages',
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
    sortOrder: 4
  }
];

let menuItems = [
  {
    _id: '1',
    name: 'Chicken Wings',
    description: 'Crispy chicken wings with buffalo sauce',
    price: 299,
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400',
    category: '1',
    isAvailable: true,
    isVegetarian: false,
    isSpicy: true,
    preparationTime: 15
  },
  {
    _id: '2',
    name: 'Vegetable Spring Rolls',
    description: 'Fresh vegetables wrapped in crispy rolls',
    price: 199,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
    category: '1',
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 10
  },
  {
    _id: '3',
    name: 'Grilled Chicken',
    description: 'Juicy grilled chicken with herbs and spices',
    price: 449,
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400',
    category: '2',
    isAvailable: true,
    isVegetarian: false,
    isSpicy: false,
    preparationTime: 25
  },
  {
    _id: '4',
    name: 'Vegetable Biryani',
    description: 'Aromatic basmati rice with mixed vegetables',
    price: 349,
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d51a?w=400',
    category: '2',
    isAvailable: true,
    isVegetarian: true,
    isSpicy: true,
    preparationTime: 30
  },
  {
    _id: '5',
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake with chocolate frosting',
    price: 199,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    category: '3',
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 5
  },
  {
    _id: '6',
    name: 'Fresh Lime Soda',
    description: 'Refreshing lime soda with mint',
    price: 89,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400',
    category: '4',
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 3
  }
];

let orders = [];
let tables = [];
let orderCounter = 1000;

// Initialize tables with QR codes
const initializeTables = async () => {
  for (let i = 1; i <= 10; i++) {
    const menuUrl = `http://localhost:3000/menu?table=${i}`;
    const qrCodeDataUrl = await QRCode.toDataURL(menuUrl);
    
    tables.push({
      _id: i.toString(),
      tableNumber: i.toString(),
      capacity: Math.floor(Math.random() * 6) + 2,
      location: i <= 5 ? 'Ground Floor' : 'First Floor',
      qrCode: qrCodeDataUrl,
      isActive: true
    });
  }
};

// API Routes

// Categories
app.get('/api/categories', (req, res) => {
  res.json(categories);
});

app.post('/api/categories', (req, res) => {
  const newCategory = {
    _id: Date.now().toString(),
    ...req.body,
    sortOrder: categories.length + 1
  };
  categories.push(newCategory);
  res.status(201).json(newCategory);
});

// Menu Items
app.get('/api/menu-items', (req, res) => {
  res.json(menuItems);
});

app.get('/api/menu-items/category/:categoryId', (req, res) => {
  const categoryItems = menuItems.filter(item => item.category === req.params.categoryId);
  res.json(categoryItems);
});

app.post('/api/menu-items', (req, res) => {
  const newItem = {
    _id: Date.now().toString(),
    ...req.body
  };
  menuItems.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/menu-items/:id', (req, res) => {
  const index = menuItems.findIndex(item => item._id === req.params.id);
  if (index !== -1) {
    menuItems[index] = { ...menuItems[index], ...req.body };
    res.json(menuItems[index]);
  } else {
    res.status(404).json({ error: 'Menu item not found' });
  }
});

app.delete('/api/menu-items/:id', (req, res) => {
  const index = menuItems.findIndex(item => item._id === req.params.id);
  if (index !== -1) {
    menuItems.splice(index, 1);
    res.json({ message: 'Menu item deleted' });
  } else {
    res.status(404).json({ error: 'Menu item not found' });
  }
});

// Orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const newOrder = {
    _id: Date.now().toString(),
    orderNumber: `ORD${orderCounter++}`,
    ...req.body,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  orders.push(newOrder);
  
  // Emit to dashboard
  io.emit('newOrder', newOrder);
  
  res.status(201).json(newOrder);
});

app.put('/api/orders/:id/status', (req, res) => {
  const index = orders.findIndex(order => order._id === req.params.id);
  if (index !== -1) {
    orders[index].status = req.body.status;
    orders[index].updatedAt = new Date();
    
    // Emit status update
    io.emit('orderStatusUpdate', orders[index]);
    
    res.json(orders[index]);
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

// Tables
app.get('/api/tables', (req, res) => {
  res.json(tables);
});

app.post('/api/tables', async (req, res) => {
  const menuUrl = `http://localhost:3000/menu?table=${req.body.tableNumber}`;
  const qrCodeDataUrl = await QRCode.toDataURL(menuUrl);
  
  const newTable = {
    _id: Date.now().toString(),
    ...req.body,
    qrCode: qrCodeDataUrl,
    isActive: true
  };
  tables.push(newTable);
  res.status(201).json(newTable);
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Dashboard connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Dashboard disconnected:', socket.id);
  });
});

// Initialize and start server
const PORT = process.env.PORT || 5000;

initializeTables().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Customer Menu: http://localhost:3000/menu?table=1`);
    console.log(`📊 Dashboard: http://localhost:3000/dashboard`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    console.log(`⚠️  Using in-memory storage (data will be lost on restart)`);
    console.log(`💡 To use MongoDB, install and start MongoDB, then use server.js instead`);
  });
});
