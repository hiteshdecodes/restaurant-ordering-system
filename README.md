# Restaurant Ordering System

A modern QR-based restaurant ordering system built with React, Node.js, Express, MongoDB, and Socket.io.

## Features

- 🍽️ **QR Code Ordering**: Each table has a unique QR code for easy menu access
- 📱 **Customer Menu**: Clean, responsive menu interface with categories and photos
- 🛒 **Shopping Cart**: Add/remove items with quantity management
- 📊 **Restaurant Dashboard**: Real-time order management and menu control
- ⚡ **Real-time Updates**: Orders appear instantly on dashboard using Socket.io
- 🏷️ **Menu Management**: Add, edit, and remove menu items and categories
- 📋 **Order Tracking**: Track orders from pending to served
- 🎯 **Table Management**: Generate and manage QR codes for tables

## Tech Stack

### Frontend
- React 18
- Material-UI (MUI)
- Socket.io Client
- Axios
- React Router

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.io
- QR Code generation

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Setup

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/restaurant_ordering
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### 3. Database Setup

Make sure MongoDB is running, then seed the database with sample data:

```bash
cd server
npm run seed
```

This will create:
- 4 categories (Appetizers, Main Course, Desserts, Beverages)
- 13 sample menu items with images
- 10 tables with QR codes

### 4. Start the Application

#### Option 1: Start both servers separately

```bash
# Terminal 1 - Start backend server
cd server
npm run dev

# Terminal 2 - Start React app
cd client
npm start
```

#### Option 2: Start both servers concurrently (from root)

```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Usage

### For Customers
1. Scan the QR code at your table
2. Browse menu by categories
3. Add items to cart
4. Enter your details (optional)
5. Place order

### For Restaurant Staff
1. Go to http://localhost:3000/dashboard
2. View real-time orders
3. Update order status
4. Manage menu items and categories
5. View QR codes for tables

## API Endpoints

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Menu Items
- `GET /api/menu-items` - Get all menu items
- `GET /api/menu-items/category/:categoryId` - Get items by category
- `POST /api/menu-items` - Create new menu item
- `PUT /api/menu-items/:id` - Update menu item
- `DELETE /api/menu-items/:id` - Delete menu item

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Cancel order

### Tables
- `GET /api/tables` - Get all tables
- `POST /api/tables` - Create new table with QR code
- `PUT /api/tables/:id` - Update table
- `PUT /api/tables/:id/regenerate-qr` - Regenerate QR code
- `DELETE /api/tables/:id` - Delete table

## Real-time Features

The system uses Socket.io for real-time communication:

- **New Order Notifications**: Dashboard receives instant notifications
- **Order Status Updates**: Real-time status changes
- **Live Order Tracking**: Orders update without page refresh

## Project Structure

```
restaurant-ordering-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Home.js
│   │   │   ├── CustomerMenu.js
│   │   │   └── Dashboard.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   │   ├── Category.js
│   │   ├── MenuItem.js
│   │   ├── Order.js
│   │   └── Table.js
│   ├── routes/            # API routes
│   │   ├── categories.js
│   │   ├── menuItems.js
│   │   ├── orders.js
│   │   └── tables.js
│   ├── server.js          # Main server file
│   ├── seed.js            # Database seeding
│   └── package.json
└── package.json           # Root package.json
```

## Customization

### Adding New Menu Items
1. Go to Dashboard → Menu Items tab
2. Click "Add Menu Item"
3. Fill in details and image URL
4. Select category and save

### Managing Orders
1. Orders appear in real-time on the dashboard
2. Update status: Pending → Confirmed → Preparing → Ready → Served
3. View order details and customer information

### QR Code Management
1. Go to Dashboard → Tables tab
2. View QR codes for each table
3. Add new tables or regenerate QR codes as needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your restaurant or modify as needed!

## Support

For issues or questions, please create an issue in the repository or contact the development team.
