const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  sequence_value: {
    type: Number,
    default: 0
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    default: null
  }
});

module.exports = mongoose.model('Counter', counterSchema);

