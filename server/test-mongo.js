const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    console.log('Connection string:', process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_ordering');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_ordering');
    console.log('✅ MongoDB connection successful!');
    
    // Test creating a simple document
    const testSchema = new mongoose.Schema({ test: String });
    const TestModel = mongoose.model('Test', testSchema);
    
    const testDoc = new TestModel({ test: 'connection test' });
    await testDoc.save();
    console.log('✅ Database write test successful!');
    
    await TestModel.deleteOne({ test: 'connection test' });
    console.log('✅ Database delete test successful!');
    
    await mongoose.connection.close();
    console.log('✅ All tests passed! MongoDB is working correctly.');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Make sure MongoDB is installed and running');
    console.log('2. Start MongoDB with: mongod');
    console.log('3. Or use MongoDB Atlas (cloud) by updating MONGODB_URI in .env');
    console.log('4. Check if port 27017 is available');
    process.exit(1);
  }
};

testConnection();
