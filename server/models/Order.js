const mongoose = require('mongoose');
const Counter = require('./Counter');

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  specialInstructions: {
    type: String,
    default: ''
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    sparse: true, // Allow multiple null values
    default: null
  },
  tableNumber: {
    type: String,
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'],
    default: 'pending'
  },
  customerName: {
    type: String,
    default: ''
  },
  customerPhone: {
    type: String,
    default: ''
  },
  specialRequests: {
    type: String,
    default: ''
  },
  estimatedTime: {
    type: Number, // in minutes
    default: 30
  }
}, {
  timestamps: true
});

// Generate sequential order number before saving (resets daily with date prefix)
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    try {
      // Get today's date in DD/MM/YY format (e.g., 19/11/25)
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear()).slice(-2);
      const datePrefix = `${day}${month}${year}`;

      const counterId = `orderNumber_${datePrefix}`;

      // Get and increment the counter atomically
      const counter = await Counter.findByIdAndUpdate(
        counterId,
        { $inc: { sequence_value: 1 }, date: datePrefix },
        { new: true, upsert: true }
      );

      // Format order number as DDMMYY0000N (e.g., 11192500001)
      const sequenceNumber = String(counter.sequence_value).padStart(5, '0');
      this.orderNumber = `${datePrefix}${sequenceNumber}`;
      console.log('Generated order number:', this.orderNumber);
    } catch (error) {
      console.error('Error generating order number:', error);
      next(error);
      return;
    }
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
