const mongoose = require('mongoose');

const tableCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#ff6b35' // Default orange color
  },
  icon: {
    type: String,
    default: 'category' // Material-UI icon name
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TableCategory', tableCategorySchema);

