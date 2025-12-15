const mongoose = require('mongoose');
const Category = require('./models/Category');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');
const QRCode = require('qrcode');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_ordering');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Category.deleteMany({});
    await MenuItem.deleteMany({});
    await Table.deleteMany({});
    console.log('Cleared existing data');

    // Create Categories
    const categories = await Category.insertMany([
      {
        name: 'Appetizers',
        description: 'Start your meal with our delicious appetizers',
        image: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400',
        sortOrder: 1
      },
      {
        name: 'Main Course',
        description: 'Hearty and satisfying main dishes',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
        sortOrder: 2
      },
      {
        name: 'Desserts',
        description: 'Sweet endings to your perfect meal',
        image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
        sortOrder: 3
      },
      {
        name: 'Beverages',
        description: 'Refreshing drinks and beverages',
        image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
        sortOrder: 4
      }
    ]);

    console.log('Created categories');

    // Create Menu Items
    const menuItems = await MenuItem.insertMany([
      // Appetizers
      {
        name: 'Chicken Wings',
        description: 'Crispy chicken wings with buffalo sauce',
        price: 299,
        image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400',
        category: categories[0]._id,
        isAvailable: true,
        isVegetarian: false,
        isSpicy: true,
        preparationTime: 15
      },
      {
        name: 'Vegetable Spring Rolls',
        description: 'Fresh vegetables wrapped in crispy rolls',
        price: 199,
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
        category: categories[0]._id,
        isAvailable: true,
        isVegetarian: true,
        isSpicy: false,
        preparationTime: 10
      },
      {
        name: 'Garlic Bread',
        description: 'Toasted bread with garlic butter and herbs',
        price: 149,
        image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400',
        category: categories[0]._id,
        isAvailable: true,
        isVegetarian: true,
        isSpicy: false,
        preparationTime: 8
      },

      // Main Course
      {
        name: 'Grilled Chicken',
        description: 'Juicy grilled chicken with herbs and spices',
        price: 449,
        image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400',
        category: categories[1]._id,
        isAvailable: true,
        isVegetarian: false,
        isSpicy: false,
        preparationTime: 25
      },
      {
        name: 'Vegetable Biryani',
        description: 'Aromatic basmati rice with mixed vegetables',
        price: 349,
        image: 'https://images.unsplash.com/photo-1563379091339-03246963d51a?w=400',
        category: categories[1]._id,
        isAvailable: true,
        isVegetarian: true,
        isSpicy: true,
        preparationTime: 30
      },
      {
        name: 'Fish Curry',
        description: 'Fresh fish cooked in coconut curry',
        price: 399,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        category: categories[1]._id,
        isAvailable: true,
        isVegetarian: false,
        isSpicy: true,
        preparationTime: 20
      },
      {
        name: 'Paneer Butter Masala',
        description: 'Cottage cheese in rich tomato gravy',
        price: 329,
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
        category: categories[1]._id,
        isAvailable: true,
        isVegetarian: true,
        isSpicy: true,
        preparationTime: 18
      },

      // Desserts
      {
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with chocolate frosting',
        price: 199,
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
        category: categories[2]._id,
        isAvailable: true,
        isVegetarian: true,
        isSpicy: false,
        preparationTime: 5
      },
      {
        name: 'Ice Cream Sundae',
        description: 'Vanilla ice cream with chocolate sauce and nuts',
        price: 149,
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
        category: categories[2]._id,
        isAvailable: true,
        isVegetarian: true,
        isSpicy: false,
        preparationTime: 3
      },
      {
        name: 'Gulab Jamun',
        description: 'Traditional Indian sweet in sugar syrup',
        price: 129,
        image: 'https://images.unsplash.com/photo-1571167530149-c72f2b4c2f8a?w=400',
        category: categories[2]._id,
        isAvailable: true,
        isVegetarian: true,
        isSpicy: false,
        preparationTime: 5
      },

      // Beverages
      {
        name: 'Fresh Lime Soda',
        description: 'Refreshing lime soda with mint',
        price: 89,
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400',
        category: categories[3]._id,
        isAvailable: true,
        isVegetarian: true,
        isSpicy: false,
        preparationTime: 3
      },
      {
        name: 'Mango Lassi',
        description: 'Creamy yogurt drink with mango',
        price: 119,
        image: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400',
        category: categories[3]._id,
        isAvailable: true,
        isVegetarian: true,
        isSpicy: false,
        preparationTime: 5
      },
      {
        name: 'Coffee',
        description: 'Freshly brewed coffee',
        price: 79,
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
        category: categories[3]._id,
        isAvailable: true,
        isVegetarian: true,
        isSpicy: false,
        preparationTime: 5
      }
    ]);

    console.log('Created menu items');

    // Create Tables with QR codes
    const tables = [];
    for (let i = 1; i <= 10; i++) {
      const menuUrl = `http://localhost:3000/menu?table=${i}`;
      const qrCodeDataUrl = await QRCode.toDataURL(menuUrl);
      
      tables.push({
        tableNumber: i.toString(),
        capacity: Math.floor(Math.random() * 6) + 2, // 2-8 people
        location: i <= 5 ? 'Ground Floor' : 'First Floor',
        qrCode: qrCodeDataUrl,
        isActive: true
      });
    }

    await Table.insertMany(tables);
    console.log('Created tables with QR codes');

    console.log('✅ Database seeded successfully!');
    console.log(`Created ${categories.length} categories`);
    console.log(`Created ${menuItems.length} menu items`);
    console.log(`Created ${tables.length} tables`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
