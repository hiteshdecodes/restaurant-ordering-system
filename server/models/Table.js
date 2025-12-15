const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: String,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  qrCode: {
    type: String, // Base64 encoded QR code or URL to QR code image
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  location: {
    type: String, // e.g., "Ground Floor", "First Floor", "Terrace"
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Table', tableSchema);
