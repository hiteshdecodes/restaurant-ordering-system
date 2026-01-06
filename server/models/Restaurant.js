const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'Restaurant Menu'
  },
  logo: {
    type: String, // URL to logo image
    default: ''
  },
  primaryColor: {
    type: String,
    default: '#ff6b35' // Default orange color
  },
  secondaryColor: {
    type: String,
    default: '#2d5016' // Default green color
  },
  description: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  postalCode: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  cuisineType: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Restaurant', restaurantSchema);

